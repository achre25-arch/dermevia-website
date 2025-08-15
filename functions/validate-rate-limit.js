/**
 * ===================================================================
 * DERMEVIA LABS - RATE LIMIT VALIDATION FUNCTION (Updated)
 * Server-side Rate Limiting Check - Custom messages & Lang Support
 * ===================================================================
 */

const crypto = require('crypto');

// ===================================================================
// CONFIGURATION - Updated limits
// ===================================================================
const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 2, // ساعتين (لكننا فعلياً سنضبطه يومياً أساساً)
  MAX_REQUESTS_PER_DAY: 2,  // مرتين في اليوم
  RATE_LIMIT_WINDOW: 3600000, // ساعة
  DAILY_LIMIT_WINDOW: 86400000, // 24 ساعة
  
  ALLOWED_ORIGINS: [
    'https://zenabiodz.com',
    'https://www.zenabiodz.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ]
};

// تخزين مؤقت
const rateStore = new Map();

// ===================================================================
// UTILITIES
// ===================================================================
function generateSecureHash(ip, id) {
  const secret = process.env.RATE_LIMIT_SECRET || 'dermevia_default_secret';
  return crypto.createHmac('sha256', secret)
    .update(`${ip}:${id}`)
    .digest('hex')
    .substring(0, 16);
}

function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return event.headers['x-nf-client-connection-ip'] || 
         event.headers['client-ip'] || '127.0.0.1';
}

function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  
  // حذف الطلبات القديمة
  const validRequests = userRequests.filter(
    timestamp => (now - timestamp) < CONFIG.DAILY_LIMIT_WINDOW
  );
  
  const dailyCount = validRequests.length;
  let status = 'allowed';
  let timeLeft = 0;
  let reason = null;
  
  if (dailyCount >= CONFIG.MAX_REQUESTS_PER_DAY) {
    status = 'blocked';
    reason = 'daily_limit';
    const oldest = Math.min(...validRequests);
    timeLeft = CONFIG.DAILY_LIMIT_WINDOW - (now - oldest);
  }
  
  return {
    status,
    allowed: status === 'allowed',
    reason,
    timeLeft,
    counts: {
      daily: dailyCount,
      maxDaily: CONFIG.MAX_REQUESTS_PER_DAY
    }
  };
}

// ===================================================================
// MAIN HANDLER
// ===================================================================
exports.handler = async (event, context) => {
  const startTime = Date.now();
  try {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }
    
    // Only GET & POST
    if (!['GET', 'POST'].includes(event.httpMethod)) {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }
    
    // قراءة البيانات
    let phone, lang = 'ar';
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      phone = body.phone;
      if (body.lang) lang = body.lang.toLowerCase();
    } else {
      phone = event.queryStringParameters?.phone;
      if (event.queryStringParameters?.lang) lang = event.queryStringParameters.lang.toLowerCase();
    }
    
    const ip = getClientIP(event);
    
    // Validate phone format
    if (!phone || !/^(05|06|07)[0-9]{8}$/.test(phone.replace(/\D/g, ''))) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, error: lang === 'fr' ? 'Numéro de téléphone invalide' : 'رقم الهاتف غير صالح' })
      };
    }
    
    // معرف الهاتف و معرف الإيبي
    const phoneId = generateSecureHash('phone', phone);
    const ipId = generateSecureHash(ip, 'ip');
    
    const phoneCheck = checkRateLimit(phoneId);
    const ipCheck = checkRateLimit(ipId);
    
    let blockedReason = null;
    let timeLeft = 0;
    let remaining = CONFIG.MAX_REQUESTS_PER_DAY;
    
    if (!phoneCheck.allowed) {
      blockedReason = 'phone';
      timeLeft = phoneCheck.timeLeft;
      remaining = CONFIG.MAX_REQUESTS_PER_DAY - phoneCheck.counts.daily;
    }
    if (!ipCheck.allowed) {
      blockedReason = blockedReason || 'ip';
      timeLeft = Math.max(timeLeft, ipCheck.timeLeft);
      remaining = Math.min(remaining, CONFIG.MAX_REQUESTS_PER_DAY - ipCheck.counts.daily);
    }
    
    if (blockedReason) {
      // صيغة الوقت
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      let messageAr, messageFr;
      if (blockedReason === 'phone') {
        messageAr = `لقد تجاوزت الحد المسموح (${CONFIG.MAX_REQUESTS_PER_DAY} طلب/يوم) لهذا الرقم\nالرجاء المحاولة بعد ${hours} ساعة و ${minutes} دقيقة.`;
        messageFr = `Vous avez dépassé la limite autorisée (${CONFIG.MAX_REQUESTS_PER_DAY} achats/jour) pour ce numéro.\nVeuillez réessayer dans ${hours}h ${minutes}min.`;
      } else {
        messageAr = `لقد تجاوزت الحد المسموح (${CONFIG.MAX_REQUESTS_PER_DAY} طلب/يوم) لهذا العنوان IP\nالرجاء المحاولة بعد ${hours} ساعة و ${minutes} دقيقة.`;
        messageFr = `Vous avez dépassé la limite autorisée (${CONFIG.MAX_REQUESTS_PER_DAY} achats/jour) pour cette adresse IP.\nVeuillez réessayer dans ${hours}h ${minutes}min.`;
      }
      
      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          blockedReason,
          remaining: Math.max(0, remaining),
          message: lang === 'fr' ? messageFr : messageAr
        })
      };
    }
    
    // تسجيل الطلب
    const now = Date.now();
    rateStore.set(phoneId, [...(rateStore.get(phoneId) || []), now]);
    rateStore.set(ipId, [...(rateStore.get(ipId) || []), now]);
    
    const processingTime = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        remaining: CONFIG.MAX_REQUESTS_PER_DAY - checkRateLimit(phoneId).counts.daily,
        langUsed: lang,
        processingTime
      })
    };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};