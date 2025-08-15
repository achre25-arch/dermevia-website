// functions/submit-form.js

/**
 * DERMEVIA LABS - FORM SUBMISSION FUNCTION
 * Netlify Functions Handler
 */

const crypto = require('crypto');

// Configuration
const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 5,
  MAX_REQUESTS_PER_DAY: 10,
  RATE_LIMIT_WINDOW: 3600000, // 1 hour
  DAILY_LIMIT_WINDOW: 86400000, // 24 hours

  TELEGRAM_API_BASE: 'https://api.telegram.org/bot',
  TELEGRAM_TIMEOUT: 15000,

  ALLOWED_ORIGINS: [
    'https://zenabiodz.com',
    'https://www.zenabiodz.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ],
  MAX_SANITIZED_LENGTH: 250
};

// ملاحظة: التخزين التالي غير دائم في Netlify
const orderStore = new Map();
const rateStore = new Map();

// Utilities
function sanitizeInput(input, maxLength = CONFIG.MAX_SANITIZED_LENGTH) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>"'&]/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

function validatePhone(phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  return /^(05|06|07)\d{8}$/.test(cleanPhone);
}

function isValidOrigin(origin) {
  if (!origin) return false;
  if (CONFIG.ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const u = new URL(origin);
    return u.protocol === 'https:' && (
      u.hostname.endsWith('.netlify.app') ||
      u.hostname === 'zenabiodz.com' ||
      u.hostname === 'www.zenabiodz.com'
    );
  } catch { return false; }
}

function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
}

// Rate limit (غير دائم)
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  const validRequests = userRequests.filter(ts => (now - ts) < CONFIG.DAILY_LIMIT_WINDOW);
  const hourlyRequests = validRequests.filter(ts => (now - ts) < CONFIG.RATE_LIMIT_WINDOW);
  if (hourlyRequests.length >= CONFIG.MAX_REQUESTS_PER_HOUR) return { allowed: false, reason: 'hourly_limit' };
  if (validRequests.length >= CONFIG.MAX_REQUESTS_PER_DAY) return { allowed: false, reason: 'daily_limit' };
  return { allowed: true };
}

function recordRequest(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  userRequests.push(now);
  const validRequests = userRequests.filter(ts => (Date.now() - ts) < CONFIG.DAILY_LIMIT_WINDOW);
  rateStore.set(identifier, validRequests);
}

// Telegram helpers
const escapeHTML = (t = '') =>
  String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Send to Telegram using HTML (أبسط وأقل مشاكل من MarkdownV2)
async function sendToTelegram(order) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram credentials (BOT_TOKEN or CHAT_ID) are not configured in environment variables.');
  }

  const message =
`🔥 <b>طلب جديد - Dermevia Pureskin</b>

👤 <b>الاسم:</b> ${escapeHTML(order.name)}
📱 <b>الهاتف:</b> ${escapeHTML(order.phone)}
📍 <b>العنوان:</b> ${escapeHTML(order.commune)}, ${escapeHTML(order.wilaya)}
📦 <b>المنتج:</b> ${escapeHTML(order.product)}
🔢 <b>الكمية:</b> ${order.quantity}
💰 <b>السعر الإجمالي:</b> ${order.total_price} دج

🚚 <b>التوصيل:</b> ${order.delivery_type === 'home' ? 'للمنزل' : 'للمكتب'}
💳 <b>تكلفة التوصيل:</b> ${order.delivery_price} دج

⏰ <b>التاريخ:</b> ${new Date(order.timestamp).toLocaleString('ar-DZ')}
🆔 <b>رقم الطلب:</b> ${escapeHTML(order.id)}
🌍 <b>IP:</b> ${escapeHTML(order.client_ip)}
🌐 <b>اللغة:</b> ${order.lang === 'ar' ? 'العربية' : 'Français'}

${order.discount_amount > 0 ? `💸 <b>خصم:</b> ${order.discount_amount} دج (${order.discount_percentage}%)` : ''}

#طلب_جديد #Dermevia #منظف_الوجه`;

  const url = `${CONFIG.TELEGRAM_API_BASE}${botToken}/sendMessage`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TELEGRAM_TIMEOUT);

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      // في حال خطأ تنسيق، أعد الإرسال كنص عادي بلا parse_mode
      if (response.status === 400) {
        const retry = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            disable_web_page_preview: true
          }),
        });
        clearTimeout(timeoutId);
        if (!retry.ok) {
          throw new Error(`Telegram retry failed: ${retry.status} - ${await retry.text()}`);
        }
        return await retry.json();
      }
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Telegram request aborted due to timeout.');
    throw error;
  }
}

// Main handler
exports.handler = async (event) => {
  const startTime = Date.now();
  const origin = event.headers.origin || event.headers.Origin;

  const corsHeaders = {
    'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
      };
    }

    const clientIP = getClientIP(event);

    const orderId = crypto.randomBytes(8).toString('hex');
    const orderTimestamp = Date.now();

    const order = {
      id: orderId,
      name: sanitizeInput(data.name),
      phone: sanitizeInput(data.phone),
      wilaya: sanitizeInput(data.wilaya),
      commune: sanitizeInput(data.commune),
      delivery_type: sanitizeInput(data.delivery_type),
      product: sanitizeInput(data.product),
      quantity: parseInt(data.quantity) || 1,
      product_price: parseInt(data.product_price) || 0,
      final_price: parseInt(data.final_price) || 0,
      subtotal_price: parseInt(data.subtotal_price) || 0,
      delivery_price: parseInt(data.delivery_price) || 0,
      total_price: parseInt(data.total_price) || 0,
      discount_amount: parseInt(data.discount_amount) || 0,
      discount_percentage: parseInt(data.discount_percentage) || 0,
      lang: data.lang === 'fr' ? 'fr' : 'ar',
      client_ip: clientIP,
      timestamp: orderTimestamp
    };

    // Validation
    if (!order.name || order.name.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid name' }) };
    }
    if (!validatePhone(order.phone)) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid phone number' }) };
    }
    if (!order.wilaya || order.wilaya.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid wilaya' }) };
    }
    if (!order.commune || order.commune.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid commune' }) };
    }
    if (!order.product || order.product.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid product' }) };
    }
    if (!['home', 'office'].includes(order.delivery_type)) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid delivery type' }) };
    }

    // Rate limit (غير دائم)
    const rateLimitId = crypto.createHash('sha256').update(`${clientIP}:${order.phone}`).digest('hex').substring(0, 16);
    const rateLimitCheck = checkRateLimit(rateLimitId);
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Too many requests', reason: rateLimitCheck.reason })
      };
    }

    // Send to Telegram
    await sendToTelegram(order);

    // Record (غير دائم)
    recordRequest(rateLimitId);
    orderStore.set(order.id, { ...order, processed_at: Date.now() });

    const processingTime = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Processing-Time': String(processingTime) },
      body: JSON.stringify({ success: true, order_id: order.id, message: 'Order submitted successfully', processing_time: processingTime })
    };

  } catch (error) {
    console.error('Order submission error:', error);
    const processingTime = Date.now() - startTime;
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': isValidOrigin(event.headers.origin || event.headers.Origin) ? (event.headers.origin || event.headers.Origin) : CONFIG.ALLOWED_ORIGINS[0], 'Vary': 'Origin', 'Content-Type': 'application/json', 'X-Processing-Time': String(processingTime) },
      body: JSON.stringify({ success: false, error: 'Internal server error', processing_time: processingTime })
    };
  }
};