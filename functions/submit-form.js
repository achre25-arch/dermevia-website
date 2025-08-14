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
  // جديد: الحد الأقصى لطول النص المعقم لتجنب قص البيانات الحساسة
  MAX_SANITIZED_LENGTH: 250 // تم تقليلها إلى 250 لتكون أكثر منطقية للأسماء والعناوين
};

// **ملاحظة مهمة:**
// هذه المتغيرات (orderStore و rateStore) تعمل فقط كـ "تخزين في الذاكرة"
// ولن تحتفظ بالبيانات بين استدعاءات وظائف Netlify المختلفة.
// للحصول على Rate Limiting فعال وتتبع الطلبات، يجب عليك استخدام
// قاعدة بيانات خارجية أو حل تخزين دائم.
// الكود الحالي سيُظهر "التخزين المؤقت" فقط، لكنه لن يعمل بشكل موثوق في الإنتاج.
const orderStore = new Map();
const rateStore = new Map(); // هذه أيضًا يجب أن تكون مخزنًا دائمًا

// Utility functions
function sanitizeInput(input, maxLength = CONFIG.MAX_SANITIZED_LENGTH) {
  if (typeof input !== 'string') return '';
  // قم بإزالة الأحرف التي يمكن أن تسبب مشاكل أو XSS
  // احتفظ بالمسافات المتعددة كمسافة واحدة فقط
  // وقص الطول للحد الأقصى
  return input
    .replace(/[<>"'&]/g, '') // إزالة < > " ' & (تجنب XSS بسيط)
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // إزالة أحرف التحكم غير المرئية
    .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
    .trim() // إزالة المسافات من البداية والنهاية
    .substring(0, maxLength); // قص الطول
}

// تم تحسين دالة التحقق من رقم الهاتف لتكون أكثر شمولاً ودقة للأرقام الجزائرية
function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, ''); // إزالة كل ما هو ليس رقم
  // Regex يتوقع 05 أو 06 أو 07 متبوعًا بـ 8 أرقام، ليصبح المجموع 10 أرقام
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
  // يفضل استخدام 'x-nf-client-connection-ip' أولاً لأنه الأكثر دقة في Netlify
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) {
    // يمكن أن يحتوي على عناوين IP متعددة، نأخذ الأول
    return forwarded.split(',')[0].trim();
  }
  return event.headers['x-nf-client-connection-ip'] || '127.0.0.1'; // IP افتراضي للطور المحلي
}

// Rate limiting (ملاحظة: هذا التخزين في الذاكرة غير فعال في الإنتاج)
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  
  // Clean old requests (إزالة الطلبات الأقدم من 24 ساعة)
  const validRequests = userRequests.filter(
    timestamp => (now - timestamp) < CONFIG.DAILY_LIMIT_WINDOW
  );
  
  // Check hourly limit (الطلبات خلال الساعة الأخيرة)
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
  
  // Clean old requests (إزالة الطلبات الأقدم من 24 ساعة للحفاظ على الذاكرة)
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
    // استخدم خطأًا مخصصًا لتسهيل تصحيح الأخطاء
    throw new Error('Telegram credentials (BOT_TOKEN or CHAT_ID) are not configured in environment variables.');
  }
  
  // يجب عليك التأكد من أن جميع البيانات المدخلة من المستخدم (مثل name، phone، commune، wilaya)
  // لا تحتوي على أحرف Markdown خاصة أو قم بالتعامل معها بشكل مناسب.
  // sanitizeInput يزيل بعضها، ولكن ليس كلها (مثل '_' أو '*' إذا لم يكن الغرض منها تنسيق).
  // لتجنب المشاكل، يمكنك استخدام طريقة `escapeMarkdown` إذا كنت متأكدًا من أنك تريد Markdown،
  // أو يمكنك ببساطة إرسال النص بدون `parse_mode: 'Markdown'`.
  const escapeTelegramMarkdown = (text) => {
    // قائمة بالأحرف الخاصة في MarkdownV2 التي يجب تهريبها
    // https://core.telegram.org/bots/api#markdownv2-style
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  };

  const message = `
🔥 *طلب جديد - Dermevia Pureskin*

👤 *الاسم:* ${escapeTelegramMarkdown(order.name)}
📱 *الهاتف:* ${escapeTelegramMarkdown(order.phone)}
📍 *العنوان:* ${escapeTelegramMarkdown(order.commune)}, ${escapeTelegramMarkdown(order.wilaya)}
📦 *المنتج:* ${escapeTelegramMarkdown(order.product)}
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
  const timeoutId = setTimeout(() => {
    controller.abort();
    // سجل خطأ في حالة انتهاء المهلة لمراقبتها
    console.warn('Telegram request timed out');
  }, CONFIG.TELEGRAM_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'MarkdownV2' // تم التغيير إلى MarkdownV2 لأنه أكثر شيوعًا ودقة
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      // سجل الرسالة الكاملة للخطأ لسهولة التصحيح
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // أضف تفاصيل أكثر للخطأ إذا كان هناك انتهاء مهلة أو خطأ شبكة
    if (error.name === 'AbortError') {
      throw new Error('Telegram request aborted due to timeout.');
    }
    throw error;
  }
}

// Main handler
exports.handler = async (event, context) => {
  const startTime = Date.now();
  let origin = event.headers.origin || event.headers.Origin; // لضمان الوصول إلى الأصل الصحيح في CORS

  // تعريف CORS headers مرة واحدة
  const corsHeaders = {
    'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };

  try {
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders, // استخدام العناوين المعرفة
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
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
      };
    }
    
    const clientIP = getClientIP(event);
    
    // Sanitize inputs and establish order object
    // **تحسين:** قم بتوليد معرف الطلب ووقت الإنشاء من جانب الخادم لضمان الفرادة وعدم التلاعب.
    const orderId = crypto.randomBytes(8).toString('hex'); // توليد معرف فريد من جانب الخادم
    const orderTimestamp = Date.now(); // استخدام وقت الخادم

    const order = {
      id: orderId, // تم استبداله بمعرف مُولد من الخادم
      name: sanitizeInput(data.name),
      phone: sanitizeInput(data.phone),
      wilaya: sanitizeInput(data.wilaya),
      commune: sanitizeInput(data.commune),
      delivery_type: sanitizeInput(data.delivery_type),
      product: sanitizeInput(data.product),
      quantity: parseInt(data.quantity) || 1,
      // تأكد من أن جميع القيم الرقمية هي أرقام وليست نصًا
      product_price: parseInt(data.product_price) || 0,
      final_price: parseInt(data.final_price) || 0,
      subtotal_price: parseInt(data.subtotal_price) || 0,
      delivery_price: parseInt(data.delivery_price) || 0,
      total_price: parseInt(data.total_price) || 0,
      discount_amount: parseInt(data.discount_amount) || 0,
      discount_percentage: parseInt(data.discount_percentage) || 0,
      lang: data.lang === 'fr' ? 'fr' : 'ar',
      client_ip: clientIP,
      timestamp: orderTimestamp // تم استبداله بوقت الخادم
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
        body: JSON.stringify({ success: false, error: 'Invalid phone number' })
      };
    }

    if (!order.wilaya || order.wilaya.length < 2) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid wilaya' })
      };
    }

    if (!order.commune || order.commune.length < 2) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid commune' })
      };
    }

    if (!order.product || order.product.length < 2) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid product' })
      };
    }

    if (!['home', 'office'].includes(order.delivery_type)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid delivery type' })
      };
    }
    
    // Rate limiting (ملاحظة: هذا التخزين في الذاكرة غير فعال في الإنتاج)
    // يجب أن يعتمد هذا على مخزن دائم مشترك بين الوظائف
    const rateLimitId = crypto
      .createHash('sha256')
      .update(`${clientIP}:${order.phone}`) // يمكن أن يكون hash لـ IP و الهاتف
      .digest('hex')
      .substring(0, 16);
    
    const rateLimitCheck = checkRateLimit(rateLimitId);
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: 'Too many requests', // رسالة عامة للعميل
          reason: rateLimitCheck.reason // سبب محدد لتصحيح الأخطاء (يمكن حذفه في الإنتاج)
        })
      };
    }
    
    // Send to Telegram
    await sendToTelegram(order);
    
    // Record successful request (ملاحظة: هذا التخزين في الذاكرة غير فعال في الإنتاج)
    recordRequest(rateLimitId);
    orderStore.set(order.id, { ...order, processed_at: Date.now() }); // هذا لن يكون دائمًا

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
    
    // **تحسين:** تأكد أن CORS headers مطبقة بشكل صحيح حتى عند حدوث أخطاء
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0], // استخدام الأصل الفعلي أو الأول
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        // يمكن تضمين رسالة الخطأ لتصحيح الأخطاء في وضع التطوير
        // error_details: error.message, 
        processing_time: processingTime
      })
    };
  }
};