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
  ]
};

// In-memory rate limiting store
const orderStore = new Map();
const rateStore = new Map();

// Utility functions
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>\"'&\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10) return false;
  if (!/^(05|06|07)/.test(cleanPhone)) return false;
  return true;
}

function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
}

// Rate limiting
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  
  // Clean old requests
  const validRequests = userRequests.filter(
    timestamp => (now - timestamp) < CONFIG.DAILY_LIMIT_WINDOW
  );
  
  // Check hourly limit
  const hourlyRequests = validRequests.filter(
    timestamp => (now - timestamp) < CONFIG.RATE_LIMIT_WINDOW
  );
  
  const dailyCount = validRequests.length;
  const hourlyCount = hourlyRequests.length;
  
  if (hourlyCount >= CONFIG.MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, reason: 'hourly_limit' };
  }
  
  if (dailyCount >= CONFIG.MAX_REQUESTS_PER_DAY) {
    return { allowed: false, reason: 'daily_limit' };
  }
  
  return { allowed: true };
}

function recordRequest(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  
  userRequests.push(now);
  
  // Clean old requests
  const validRequests = userRequests.filter(
    timestamp => (now - timestamp) < CONFIG.DAILY_LIMIT_WINDOW
  );
  
  rateStore.set(identifier, validRequests);
}

// Send to Telegram
async function sendToTelegram(order) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    throw new Error('Telegram credentials not configured');
  }
  
  const message = `
🔥 *طلب جديد - Dermevia Pureskin*

👤 *الاسم:* ${order.name}
📱 *الهاتف:* ${order.phone}
📍 *العنوان:* ${order.commune}, ${order.wilaya}
📦 *المنتج:* ${order.product}
🔢 *الكمية:* ${order.quantity}
💰 *السعر الإجمالي:* ${order.total_price} دج

🚚 *التوصيل:* ${order.delivery_type === 'home' ? 'للمنزل' : 'للمكتب'}
💳 *تكلفة التوصيل:* ${order.delivery_price} دج

⏰ *التاريخ:* ${new Date(order.timestamp).toLocaleString('ar-DZ')}
🆔 *رقم الطلب:* ${order.id}
🌍 *IP:* ${order.client_ip}
🌐 *اللغة:* ${order.lang === 'ar' ? 'العربية' : 'Français'}

${order.discount_amount > 0 ? `💸 *خصم:* ${order.discount_amount} دج (${order.discount_percentage}%)` : ''}

#طلب_جديد #Dermevia #منظف_الوجه
  `;
  
  const url = `${CONFIG.TELEGRAM_API_BASE}${botToken}/sendMessage`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TELEGRAM_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Main handler
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    const origin = event.headers.origin || event.headers.Origin;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    };
    
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }
    
    // Parse and validate request
    const data = JSON.parse(event.body || '{}');
    const clientIP = getClientIP(event);
    
    // Sanitize inputs
    const order = {
      id: sanitizeInput(data.id),
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
      timestamp: data.timestamp || Date.now()
    };
    
    // Basic validation
    if (!order.name || order.name.length < 2) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid name' })
      };
    }
    
    if (!validatePhone(order.phone)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid phone' })
      };
    }
    
    // Rate limiting
    const rateLimitId = crypto
      .createHash('sha256')
      .update(`${clientIP}:${order.phone}`)
      .digest('hex')
      .substring(0, 16);
    
    const rateLimitCheck = checkRateLimit(rateLimitId);
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: 'rate_limit',
          reason: rateLimitCheck.reason
        })
      };
    }
    
    // Send to Telegram
    await sendToTelegram(order);
    
    // Record successful request
    recordRequest(rateLimitId);
    orderStore.set(order.id, { ...order, processed_at: Date.now() });
    
    const processingTime = Date.now() - startTime;
    
    return {
      statusCode: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      },
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        message: 'Order submitted successfully',
        processing_time: processingTime
      })
    };
    
  } catch (error) {
    console.error('Order submission error:', error);
    
    const processingTime = Date.now() - startTime;
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        processing_time: processingTime
      })
    };
  }
};