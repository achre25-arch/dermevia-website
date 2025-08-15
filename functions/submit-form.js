// functions/submit-form.js
const crypto = require('crypto');

const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 5,
  MAX_REQUESTS_PER_DAY: 2, // طلبان في 24 ساعة
  RATE_LIMIT_WINDOW: 3600000,
  DAILY_LIMIT_WINDOW: 86400000,
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

const I18N = {
  ar: {
    success: 'تم إرسال طلبك بنجاح.',
    rate_limit_exceeded: 'عذراً، لقد وصلت إلى الحد اليومي لعدد الطلبات. يُسمح بطلبين فقط خلال 24 ساعة لنفس رقم الهاتف وعنوان IP.',
    invalid_name: 'الاسم غير صالح.',
    invalid_phone: 'رقم الهاتف غير صالح (10 أرقام ويبدأ بـ 05 أو 06 أو 07).',
    invalid_wilaya: 'الولاية غير صالحة.',
    invalid_commune: 'البلدية غير صالحة.',
    invalid_product: 'اسم المنتج غير صالح.',
    invalid_delivery_type: 'نوع التوصيل غير صالح.'
  },
  fr: {
    success: 'Votre commande a été envoyée avec succès.',
    rate_limit_exceeded: 'Désolé, vous avez atteint la limite quotidienne. Deux commandes sont autorisées en 24h pour le même numéro et la même adresse IP.',
    invalid_name: 'Nom invalide.',
    invalid_phone: 'Numéro de téléphone invalide (10 chiffres, commence par 05/06/07).',
    invalid_wilaya: 'Wilaya invalide.',
    invalid_commune: 'Commune invalide.',
    invalid_product: 'Produit invalide.',
    invalid_delivery_type: 'Type de livraison invalide.'
  }
};
const L = (lang) => (I18N[lang] || I18N.ar);

// Fallback (غير دائم)
const rateStore = new Map();

function sanitizeInput(input, maxLength = CONFIG.MAX_SANITIZED_LENGTH) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>"'&]/g, '').replace(/[\x00-\x1f\x7f-\x9f]/g, '').replace(/\s+/g, ' ').trim().substring(0, maxLength);
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
    return u.protocol === 'https:' && (u.hostname.endsWith('.netlify.app') || u.hostname === 'zenabiodz.com' || u.hostname === 'www.zenabiodz.com');
  } catch { return false; }
}
function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
}
function checkRateLimitMemory(identifier) {
  const now = Date.now();
  const windowMs = CONFIG.DAILY_LIMIT_WINDOW;
  const arr = rateStore.get(identifier) || [];
  const valid = arr.filter(ts => (now - ts) < windowMs);
  if (valid.length >= CONFIG.MAX_REQUESTS_PER_DAY) return { allowed: false, reason: 'daily_limit' };
  return { allowed: true, count: valid.length, remaining: CONFIG.MAX_REQUESTS_PER_DAY - valid.length };
}
function recordRequestMemory(identifier) {
  const now = Date.now();
  const windowMs = CONFIG.DAILY_LIMIT_WINDOW;
  const arr = rateStore.get(identifier) || [];
  arr.push(now);
  const valid = arr.filter(ts => (Date.now() - ts) < windowMs);
  rateStore.set(identifier, valid);
}

const escapeHTML = (t = '') =>
  String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

async function sendToTelegram(order) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) throw new Error('Telegram credentials missing');

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
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: controller.signal
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 400) {
        const retry = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true })
        });
        clearTimeout(timeoutId);
        if (!retry.ok) throw new Error(`Telegram retry failed: ${retry.status} - ${await retry.text()}`);
        return await retry.json();
      }
      throw new Error(`Telegram API error: ${res.status} - ${t}`);
    }
    clearTimeout(timeoutId);
    return await res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') throw new Error('Telegram request aborted due to timeout.');
    throw e;
  }
}

// Google Sheets calls
async function gasCheckAndRecord(ip, phone) {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return null; // غير مفعّل
  const payload = { secret, action: 'check_and_record', ip, phone, limit: 2, windowMs: CONFIG.DAILY_LIMIT_WINDOW };
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  let json = {};
  try { json = await res.json(); } catch { json = { parse_error: true, status: res.status }; }
  return json;
}
async function gasAppendOrder(order) {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return { skipped: true, reason: 'not_configured' };
  const payload = {
    secret,
    action: 'append_order',
    data: {
      timestamp: order.timestamp, id: order.id, name: order.name, phone: order.phone,
      wilaya: order.wilaya, commune: order.commune, delivery_type: order.delivery_type,
      product: order.product, quantity: order.quantity, product_price: order.product_price,
      final_price: order.final_price, subtotal_price: order.subtotal_price, delivery_price: order.delivery_price,
      total_price: order.total_price, discount_amount: order.discount_amount, discount_percentage: order.discount_percentage,
      client_ip: order.client_ip, lang: order.lang
    }
  };
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  let json = {};
  try { json = await res.json(); } catch { json = { parse_error: true, status: res.status }; }
  if (!json || json.success !== true) return { success: false, status: res.status, body: json };
  return { success: true };
}

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
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
    }

    let data;
    try { data = JSON.parse(event.body || '{}'); }
    catch { return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) }; }

    const clientIP = getClientIP(event);
    const lang = data.lang === 'fr' ? 'fr' : 'ar';

    const order = {
      id: crypto.randomBytes(8).toString('hex'),
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
      lang,
      client_ip: clientIP,
      timestamp: Date.now()
    };

    // تحقق الحقول (برسائل حسب اللغة)
    if (!order.name || order.name.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_name }) };
    }
    if (!validatePhone(order.phone)) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_phone }) };
    }
    if (!order.wilaya || order.wilaya.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_wilaya }) };
    }
    if (!order.commune || order.commune.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_commune }) };
    }
    if (!order.product || order.product.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_product }) };
    }
    if (!['home', 'office'].includes(order.delivery_type)) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_delivery_type }) };
    }

    // حد يومي دائم عبر GAS
    const gasLimit = await gasCheckAndRecord(order.client_ip, order.phone);
    if (gasLimit && gasLimit.success !== false) {
      if (gasLimit.allowed === false) {
        return {
          statusCode: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Too many requests',
            message: L(lang).rate_limit_exceeded,
            limit_info: { limit: 2, remaining: 0, reset_in_ms: gasLimit.resetInMs || undefined }
          })
        };
      }
    } else {
      // Fallback غير دائم
      const id = crypto.createHash('sha256').update(`${order.client_ip}:${order.phone}`).digest('hex').substring(0, 16);
      const mem = checkRateLimitMemory(id);
      if (!mem.allowed) {
        return {
          statusCode: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Too many requests', message: L(lang).rate_limit_exceeded })
        };
      }
      recordRequestMemory(id);
    }

    // Telegram ثم Google Sheets
    await sendToTelegram(order);
    const sheetsResult = await gasAppendOrder(order);

    const processingTime = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Processing-Time': String(processingTime) },
      body: JSON.stringify({
        success: true,
        message: L(lang).success,
        order_id: order.id,
        processing_time: processingTime,
        limit_info: gasLimit && gasLimit.success ? { limit: gasLimit.limit, remaining: gasLimit.remaining } : undefined,
        sheets_result: sheetsResult
      })
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