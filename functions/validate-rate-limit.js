/**
 * ===================================================================
 * DERMEVIA LABS - RATE LIMIT VALIDATION FUNCTION (Full Updated Version)
 * ===================================================================
 */

const crypto = require('crypto');

const CONFIG = {
  MAX_REQUESTS_PER_DAY: 2, // الحد الأقصى: مرتين يومياً
  DAILY_LIMIT_WINDOW: 86400000, // 24 ساعة بالمللي ثانية
  ALLOWED_ORIGINS: [
    'https://zenabiodz.com',
    'https://www.zenabiodz.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ]
};

// تخزين مؤقت في الذاكرة، يُعاد ضبطه عند إعادة تشغيل السيرفر (Netlify Function)
const rateStore = new Map();

// توليد Hash آمن لتمييز كل IP وكل رقم هاتف
function generateSecureHash(key1, key2) {
  const secret = process.env.RATE_LIMIT_SECRET || 'dermevia_default_secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${key1}:${key2}`)
    .digest('hex')
    .substring(0, 16);
}

function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    '127.0.0.1'
  );
}

function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  const validRequests = userRequests.filter(
    (ts) => now - ts < CONFIG.DAILY_LIMIT_WINDOW
  );
  const dailyCount = validRequests.length;
  let status = 'allowed';
  let timeLeft = 0;
  if (dailyCount >= CONFIG.MAX_REQUESTS_PER_DAY) {
    status = 'blocked';
    const oldest = Math.min(...validRequests);
    timeLeft = CONFIG.DAILY_LIMIT_WINDOW - (now - oldest);
  }
  return {
    allowed: status === 'allowed',
    dailyCount,
    timeLeft
  };
}

exports.handler = async (event) => {
  try {
    const origin = event.headers.origin || event.headers.Origin;

    // دعم CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin)
            ? origin
            : CONFIG.ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }

    if (!['GET', 'POST'].includes(event.httpMethod)) {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin)
            ? origin
            : CONFIG.ALLOWED_ORIGINS[0]
        },
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }

    let phone;
    let lang = 'ar';
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      phone = body.phone;
      if (body.lang) lang = body.lang.toLowerCase();
    } else {
      phone = event.queryStringParameters?.phone;
      if (event.queryStringParameters?.lang)
        lang = event.queryStringParameters.lang.toLowerCase();
    }

    const ip = getClientIP(event);

    // التحقق من صحة الهاتف
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!/^(05|06|07)[0-9]{8}$/.test(cleanPhone)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin)
            ? origin
            : CONFIG.ALLOWED_ORIGINS[0]
        },
        body: JSON.stringify({
          success: false,
          error: lang === 'fr'
            ? 'Numéro de téléphone invalide'
            : 'رقم الهاتف غير صالح'
        })
      };
    }

    // معرفات التخزين
    const phoneId = generateSecureHash('phone', cleanPhone);
    const ipId = generateSecureHash(ip, 'ip');

    const phoneCheck = checkRateLimit(phoneId);
    const ipCheck = checkRateLimit(ipId);

    // إذا تم الحظر
    if (!phoneCheck.allowed || !ipCheck.allowed) {
      const reason = !phoneCheck.allowed ? 'phone' : 'ip';
      const timeLeft = !phoneCheck.allowed
        ? phoneCheck.timeLeft
        : ipCheck.timeLeft;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
      );

      let message;
      if (lang === 'fr') {
        message =
          reason === 'phone'
            ? `Vous avez atteint la limite (${CONFIG.MAX_REQUESTS_PER_DAY} achats/jour) pour ce numéro. Réessayez dans ${hours}h ${minutes}min.`
            : `Vous avez atteint la limite (${CONFIG.MAX_REQUESTS_PER_DAY} achats/jour) pour cette adresse IP. Réessayez dans ${hours}h ${minutes}min.`;
      } else {
        message =
          reason === 'phone'
            ? `لقد تجاوزت الحد (${CONFIG.MAX_REQUESTS_PER_DAY} طلب/يوم) لهذا الرقم. الرجاء المحاولة بعد ${hours} ساعة و ${minutes} دقيقة.`
            : `لقد تجاوزت الحد (${CONFIG.MAX_REQUESTS_PER_DAY} طلب/يوم) لهذا الـ IP. الرجاء المحاولة بعد ${hours} ساعة و ${minutes} دقيقة.`;
      }

      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin)
            ? origin
            : CONFIG.ALLOWED_ORIGINS[0]
        },
        body: JSON.stringify({
          success: false,
          error: 'rate_limit',
          message,
          ttlMs: timeLeft
        })
      };
    }

    // تسجيل الطلب الجديد
    const now = Date.now();
    rateStore.set(phoneId, [...(rateStore.get(phoneId) || []), now]);
    rateStore.set(ipId, [...(rateStore.get(ipId) || []), now]);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin(origin)
          ? origin
          : CONFIG.ALLOWED_ORIGINS[0]
      },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS[0] },
      body: JSON.stringify({ success: false, error: 'server_error' })
    };
  }
};