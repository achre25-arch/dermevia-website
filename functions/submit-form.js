// functions/submit-form.js
const crypto = require('crypto');

const CONFIG = {
  DAILY_LIMIT: 2,                 // طلبان خلال 24 ساعة لنفس (IP + phone_norm)
  WINDOW_MS: 86400000,            // 24 ساعة
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

// i18n
const I18N = {
  ar: {
    success: 'تم إرسال طلبك بنجاح.',
    rate_limit_exceeded: 'عذراً، لقد وصلت إلى الحد اليومي. يُسمح بطلبين فقط خلال 24 ساعة لنفس رقم الهاتف وعنوان IP.',
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

// Utilities
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
  const f = event.headers['x-forwarded-for'];
  if (f) return f.split(',')[0].trim();
  return event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
}
function sanitizeText(s, max = CONFIG.MAX_SANITIZED_LENGTH) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>"'&]/g,'').replace(/[\x00-\x1f\x7f-\x9f]/g,'').replace(/\s+/g,' ').trim().substring(0, max);
}
function normalizePhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('213')) {
    const rest = d.slice(3);
    if (rest.length === 9) return '0' + rest;
    if (rest.length === 10 && rest.startsWith('0')) return rest;
  }
  if (d.length === 10 && d.startsWith('0')) return d;
  return d;
}
function validatePhoneNormalized(pn) {
  return /^(05|06|07)\d{8}$/.test(pn);
}
const escapeHTML = (t = '') =>
  String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

// Redis (Upstash) rate limit: atomic INCR + set TTL only on first hit
async function rlIncrement(ip, phoneNorm, { limit = CONFIG.DAILY_LIMIT, windowMs = CONFIG.WINDOW_MS } = {}) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) {
    return { ok: false, error: 'rate_limit_not_configured' };
  }
  const key = `rate:${ip}|${phoneNorm}`;
  const headers = { Authorization: `Bearer ${token}` };

  // 1) INCR
  const r1 = await fetch(`${base}/incr/${encodeURIComponent(key)}`, { headers });
  if (!r1.ok) {
    const txt = await r1.text().catch(()=>'');
    return { ok: false, error: `redis_incr_failed: ${r1.status} ${txt}` };
  }
  const j1 = await r1.json().catch(()=> ({}));
  const count = typeof j1.result === 'number' ? j1.result : Number(j1);

  // 2) إذا كانت أول مرة، ضع TTL = 24 ساعة
  if (count === 1) {
    await fetch(`${base}/pexpire/${encodeURIComponent(key)}/${windowMs}`, { headers }).catch(()=>{});
  }

  return { ok: true, allowed: count <= limit, count, limit };
}

// Telegram
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

// Google Apps Script append (Orders)
async function sendToGoogleSheet(order) {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) {
    console.warn('Google Sheets not configured. Skipping append.');
    return { skipped: true, reason: 'not_configured' };
  }
  const payload = {
    secret,
    action: 'append_order',
    data: {
      timestamp: order.timestamp,
      id: order.id,
      name: order.name,
      phone: order.phone,
      wilaya: order.wilaya,
      commune: order.commune,
      delivery_type: order.delivery_type,
      product: order.product,
      quantity: order.quantity,
      product_price: order.product_price,
      final_price: order.final_price,
      subtotal_price: order.subtotal_price,
      delivery_price: order.delivery_price,
      total_price: order.total_price,
      discount_amount: order.discount_amount,
      discount_percentage: order.discount_percentage,
      client_ip: order.client_ip,
      lang: order.lang
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
    catch {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) };
    }

    const lang = data.lang === 'fr' ? 'fr' : 'ar';
    const clientIP = getClientIP(event);

    // بناء الطلب
    const order = {
      id: crypto.randomBytes(8).toString('hex'),
      name: sanitizeText(data.name),
      phone: sanitizeText(data.phone),
      phone_norm: normalizePhone(data.phone),
      wilaya: sanitizeText(data.wilaya),
      commune: sanitizeText(data.commune),
      delivery_type: sanitizeText(data.delivery_type),
      product: sanitizeText(data.product),
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

    // تحقق الحقول برسائل اللغة
    if (!order.name || order.name.length < 2) {
      return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: L(lang).invalid_name }) };
    }
    if (!validatePhoneNormalized(order.phone_norm)) {
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

    // Rate limit (ذري عبر Upstash Redis)
    const rl = await rlIncrement(order.client_ip, order.phone_norm, { limit: CONFIG.DAILY_LIMIT, windowMs: CONFIG.WINDOW_MS });
    if (!rl.ok) {
      // إن لم يتم ضبط Upstash، نرفض بوضوح حتى يتم تهيئته (حل جذري يتطلبه)
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Rate limiter misconfigured', details: rl.error })
      };
    }
    if (!rl.allowed) {
      return {
        statusCode: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Too many requests',
          message: L(lang).rate_limit_exceeded,
          limit_info: { limit: rl.limit, count: rl.count }
        })
      };
    }

    // Telegram
    await sendToTelegram(order);

    // Append إلى Google Sheets (اختياري)
    const sheetsResult = await sendToGoogleSheet(order);

    const processingTime = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Processing-Time': String(processingTime) },
      body: JSON.stringify({
        success: true,
        message: L(lang).success,
        order_id: order.id,
        processing_time: processingTime,
        sheets_result: sheetsResult
      })
    };

  } catch (error) {
    console.error('Order submission error:', error);
    const processingTime = Date.now() - startTime;
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin(event.headers.origin || event.headers.Origin) ? (event.headers.origin || event.headers.Origin) : CONFIG.ALLOWED_ORIGINS[0],
        'Vary': 'Origin',
        'Content-Type': 'application/json',
        'X-Processing-Time': String(processingTime)
      },
      body: JSON.stringify({ success: false, error: 'Internal server error', processing_time: processingTime })
    };
  }
};