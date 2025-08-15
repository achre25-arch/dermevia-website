'use strict';

// =========== ENHANCED SECURITY CONFIGURATION ===========
const CONFIG = {
  NETLIFY_FUNCTIONS_BASE: '/.netlify/functions',
  SUBMIT_ENDPOINT: '/.netlify/functions/submit-form',
  PHONE_COOLDOWN_MS: 24 * 60 * 60 * 1000, // 24h to match server
  MAX_ORDERS_PER_PHONE: 2,
  MAX_RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 25000, // 25s
  SECURITY_SALT: 'dermevia_2024_secure_salt',
  ENCRYPTION_KEY: 'dermevia_advanced_encryption',
  FALLBACK_VALIDATION: true,
  DEBUG_MODE: false
};

// =========== COMMUNES DATA ===========
const communesData = {
  "16": ["الجزائر الوسطى","سيدي أمحمد","المدنية","المرادية","باب الوادي","القصبة","بولوغين","واد قريش","رايس حميدو","المقارية","الحامة","حسين داي","القبة","بن عكنون","بني مسوس","بوزريعة","الأبيار","بئر مراد رايس","بئر خادم","جسر قسنطينة","حيدرة","سحاولة","باش جراح","بوروبة","الحراش","وادي السمار","عين طاية","باب الزوار","برج البحري","برج الكيفان","الدار البيضاء","المرسى","المحمدية","عين البنيان","الشراقة","دالي ابراهيم","أولاد فايت","الحمامات","المحالمة","الرحمانية","السويدانية","سطاوالي","زرالدة","بابا حسن","دويرة","الدرارية","العاشور","خرايسية","بئر توتة","أولاد شبل","تسالة المرجة","براقي","الكاليتوس","سيدي موسى","هراوة","الرغاية","الرويبة"],
  "31": ["وهران","أرزيو","العلايمية","الكرمة","بئر الجير","البرية","بطيوة","بن فريحة","بوتليليس","بوسفر","بوفاطيس","حاسي بن عقبة","حاسي بونيف","حاسي مفسوخ","دوار الملح","السانية","سيدي الشحمي","سيدي بن يبقى","سيق","طفراوي","العنصر","عين البية","عين الترك","عين الكرمة","قديل","مرسى الحجاج","المرسى الكبير","مسرغين","وادي تليلات"],
  "25": ["قسنطينة","الخروب","عين سمارة","أولاد رحمون","عين عبيد","ابن باديس","زيغود يوسف","بني حميدان","حامة بوزيان","ديدوش مراد","ابن زياد","مسعود بوجريو"]
};

// =========== TRANSLATIONS ===========
const i18n = {
  ar: { 
    productBadge: "✨ حصرياً من Dermevia Labs",
    heroTitle: "Dermevia Pureskin",
    heroSubtitle: "منظف الوجه المتطور بالكبريت الطبيعي", 
    heroDescription: "تركيبة علمية متقدمة مُصممة خصيصاً لعلاج البشرة الدهنية وحب الشباب",
    ctaButton: "احصلي على Dermevia Pureskin الآن",
    orderTitle: "املأي البيانات وأتمي طلبك الآمن",
    quantityHeaderLabel: "عدد القطع:",
    nameLabel: "👤 الاسم الأول * (اللقب اختياري)",
    phoneLabel: "📱 رقم الهاتف *",
    wilayaLabel: "📍 الولاية *",
    communeLabel: "🏘️ البلدية *",
    deliveryTypeLabel: "🚚 نوع التوصيل *",
    selectWilaya: "اختاري ولايتك",
    selectCommune: "اختاري بلديتك",
    selectDelivery: "اختاري نوع التوصيل",
    homeText: "🏠 توصيل للمنزل",
    officeText: "🏢 توصيل للمكتب",
    confirm: "تأكيد الطلب الآمن مع الضمان",
    sending: "معالجة آمنة...",
    phoneHintShort: "❌ يجب أن يكون الرقم 10 خانات",
    phoneHintPrefix: "❌ يجب أن يبدأ بـ 05 أو 06 أو 07",
    phoneHintOk: "✅ رقم صحيح",
    errName: "يرجى إدخال الاسم الأول على الأقل (2+ أحرف)",
    errPhone: "يرجى إدخال رقم هاتف صحيح",
    errWilaya: "يرجى اختيار الولاية",
    errCommune: "يرجى اختيار البلدية", 
    errDelivery: "يرجى اختيار نوع التوصيل",
    successMessage: "✅ تم إرسال طلبك بنجاح وبأمان! سنتواصل معك قريباً",
    errorMessage: "❌ حدث خطأ. يرجى المحاولة مرة أخرى",
    networkError: "🌐 مشكلة في الاتصال. يرجى التحقق من الإنترنت",
    serverError: "🔧 مشكلة في الخادم. يرجى المحاولة بعد قليل",
    rateLimitTitle: "⚠️ تم تجاوز الحد المسموح",
    rateLimitText: "يمكنك تقديم طلبين كحد أقصى خلال 24 ساعة. يرجى المحاولة بعد:", // The base text for the countdown
    currency: "دج"
    // ... other AR translations
  },
  fr: { 
    productBadge: "✨ Innovation Dermevia Labs",
    heroTitle: "Dermevia Pureskin",
    heroSubtitle: "Nettoyant facial révolutionnaire au soufre", 
    heroDescription: "Formule scientifique avancée...",
    ctaButton: "Commandez Dermevia Pureskin maintenant",
    orderTitle: "Complétez votre commande sécurisée",
    quantityHeaderLabel: "Quantité:",
    nameLabel: "👤 Prénom * (nom de famille optionnel)",
    phoneLabel: "📱 Numéro de téléphone *",
    wilayaLabel: "📍 Wilaya *",
    communeLabel: "🏘️ Commune *",
    deliveryTypeLabel: "🚚 Mode de livraison *",
    selectWilaya: "Choisissez votre wilaya",
    selectCommune: "Choisissez votre commune",
    selectDelivery: "Choisissez le mode de livraison",
    homeText: "🏠 Livraison à domicile",
    officeText: "🏢 Livraison au bureau",
    confirm: "Confirmer la commande sécurisée avec garantie",
    sending: "Traitement sécurisé...",
    phoneHintShort: "❌ Le numéro doit contenir 10 chiffres",
    phoneHintPrefix: "❌ Doit commencer par 05, 06 ou 07",
    phoneHintOk: "✅ Numéro valide",
    errName: "Veuillez saisir au moins votre prénom (2+ caractères)",
    errPhone: "Veuillez saisir un numéro de téléphone valide",
    errWilaya: "Veuillez sélectionner la wilaya",
    errCommune: "Veuillez sélectionner la commune",
    errDelivery: "Veuillez choisir le mode de livraison",
    successMessage: "✅ Votre commande sécurisée a été enregistrée !",
    errorMessage: "❌ Une erreur s'est produite. Veuillez réessayer",
    networkError: "🌐 Problème de connexion.",
    serverError: "🔧 Problème serveur.",
    rateLimitTitle: "⚠️ Limite de commandes atteinte",
    rateLimitText: "Maximum 2 commandes par 24h autorisées. Réessayez dans:", // The base text for the countdown
    currency: "DA"
    // ... other FR translations
  }
};


// =========== GLOBAL STATE ===========
let clientIP = null;
let securityFingerprint = null;
let rateCountdownInterval = null;

// =========== SECURITY & UTILITY FUNCTIONS (Unchanged) ===========
function generateSecurityFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Dermevia Security Check', 2, 2);
    const fingerprint = {
      canvas: canvas.toDataURL(), screen: `${screen.width}x${screen.height}x${screen.colorDepth}`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language,
      platform: navigator.platform, userAgent: navigator.userAgent.substring(0, 100), timestamp: Date.now(),
    };
    securityFingerprint = btoa(JSON.stringify(fingerprint)).substring(0, 32);
    return securityFingerprint;
  } catch { securityFingerprint = 'fallback_' + Date.now(); return securityFingerprint; }
}
async function fetchIPSecure() {
  try {
    const isLocal = ['localhost','127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
    if (isLocal) { clientIP = 'local_' + Date.now().toString(36); return; }
    const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal, mode: 'cors', headers: { 'Accept': 'application/json' } });
      clearTimeout(timeoutId);
      if (res.ok) { const data = await res.json(); clientIP = data.ip; } else throw new Error('IP fetch failed');
    } catch {
      clearTimeout(timeoutId);
      try {
        const controller2 = new AbortController(); const t2 = setTimeout(() => controller2.abort(), 5000);
        const res2 = await fetch('https://ipapi.co/json/', { signal: controller2.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(t2);
        if (res2.ok) { const j = await res2.json(); clientIP = j.ip; } else throw new Error('Fallback failed');
      } catch { clientIP = 'unknown_' + Date.now().toString(36); }
    }
  } catch { clientIP = 'error_' + Date.now().toString(36); }
}
function validatePhoneAdvanced(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10) return false;
  if (!/^(05|06|07)/.test(cleanPhone)) return false;
  const suspiciousPatterns = [/^(.)\1{9}$/, /^0123456789$/, /^0987654321$/];
  return !suspiciousPatterns.some(p => p.test(cleanPhone));
}
function validateNameAdvanced(name) {
  if (!name || name.length < 2 || name.length > 100) return false;
  const validNamePattern = /^[\u0600-\u06FF\u0750-\u077F\s\u064B-\u0652a-zA-ZÀ-ÿ\-'\.]+$/;
  if (!validNamePattern.test(name)) return false;
  const words = name.trim().split(/\s+/).filter(w => w.length >= 2);
  if (words.length < 1) return false;
  const suspicious = [/test/i,/admin/i,/null/i,/undefined/i,/script/i,/select/i,/drop/i,/delete/i,/insert/i,/update/i,/create/i,/alter/i,/^(.)\1+$/, /^\d+$/, /^[^a-zA-Z\u0600-\u06FF]+$/];
  return !suspicious.some(p => p.test(name));
}
function getLang() { return localStorage.getItem('dermevia_lang') || 'ar'; }
function saveOrderLocally(order) {
  try {
    const orders = JSON.parse(localStorage.getItem('dermevia_orders') || '[]');
    orders.unshift(order); if (orders.length > 10) orders.splice(10);
    localStorage.setItem('dermevia_orders', JSON.stringify(orders));
    localStorage.setItem('dermevia_last_order', JSON.stringify(order));
  } catch {}
}
function formatTimeLeft(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2,'0'); s%=3600;
  const m = String(Math.floor(s / 60)).padStart(2,'0'); s%=60;
  return `${h}:${m}:${String(s).padStart(2,'0')}`;
}
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// =========== UI HELPER FUNCTIONS ===========
function showError(message) {
  const errorBox = document.getElementById('errorBox');
  hideMessages();
  if (errorBox) { errorBox.textContent = message; errorBox.style.display = 'block'; }
  setTimeout(() => { errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}
function hideMessages() {
  ['errorBox','successBox','alreadyBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  if (rateCountdownInterval) clearInterval(rateCountdownInterval);
}
function showLoadingState(button) {
  if (!button) return;
  button.disabled = true; button.classList.add('loading');
  button.dataset.originalText = button.textContent;
  const lang = getLang(); let dots = '';
  const loadingText = i18n[lang].sending;
  const interval = setInterval(() => {
    dots = dots.length >= 3 ? '' : dots + '.';
    button.textContent = loadingText + dots;
  }, 500);
  button.dataset.loadingInterval = interval;
}
function resetButtonState(button) {
  if (!button) return;
  const interval = button.dataset.loadingInterval;
  if (interval) clearInterval(parseInt(interval));
  button.disabled = false; button.classList.remove('loading');
  button.textContent = button.dataset.originalText || i18n[getLang()].confirm;
  button.style.background = 'linear-gradient(135deg, #009fe3, #0086c7)';
}

// =========== >> CORE FIX << : RATE LIMIT COUNTDOWN UI ===========
function showServerRateLimitCountdown(ttlMs, serverMessage) {
  const lang = getLang();
  hideMessages();
  const box = document.getElementById('alreadyBox');
  const title = document.getElementById('alreadyTitle');
  const textEl = document.getElementById('alreadyText');
  const baseText = serverMessage || i18n[lang].rateLimitText;

  if (title) title.textContent = i18n[lang].rateLimitTitle;
  if (box) box.style.display = 'block';

  if (rateCountdownInterval) clearInterval(rateCountdownInterval);
  const end = Date.now() + Number(ttlMs || CONFIG.PHONE_COOLDOWN_MS);

  const update = () => {
    const left = Math.max(0, end - Date.now());
    const hhmmss = formatTimeLeft(left);
    if (textEl) textEl.textContent = baseText.includes(':') ? baseText.split(':')[0] + ': ' + hhmmss : baseText + ' ' + hhmmss;
    if (left <= 0 && rateCountdownInterval) {
      clearInterval(rateCountdownInterval);
      hideMessages();
    }
  };
  update();
  rateCountdownInterval = setInterval(update, 1000);

  box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// =========== >> CORE FIX << : SECURE ORDER SENDER ===========
async function sendOrderSecure(data) {
  const secureData = {
    ...data,
    security_fingerprint: securityFingerprint, client_ip: clientIP, user_agent: navigator.userAgent.substring(0, 200),
    referer: window.location.href, origin: window.location.origin, timestamp_client: Date.now(), request_id: generateRequestId()
  };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    const response = await fetch(CONFIG.SUBMIT_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(secureData), signal: controller.signal
    });
    clearTimeout(timeoutId);

    // Try to parse JSON regardless of status
    let json = {};
    try { json = await response.json(); } catch {}

    // Specific handling for 429 Rate Limit
    if (response.status === 429) {
      const ttlMs = Number(json?.limit_info?.next_available_in_ms ?? CONFIG.PHONE_COOLDOWN_MS);
      // Use the message from the server if it exists, otherwise use the base text
      const message = json?.message || i18n[getLang()].rateLimitText;
      return { success: false, error: 'rate_limit', message, ttlMs };
    }
    
    // Handle other non-ok responses
    if (!response.ok) {
      const errorMsg = json?.error || `Server error: ${response.status}`;
      return { success: false, error: 'server', message: errorMsg };
    }

    // Handle success
    return { success: true, data: json };

  } catch (error) {
    // Handle network errors or timeouts
    if (error.name === 'AbortError') return { success: false, error: 'timeout' };
    return { success: false, error: 'network' };
  }
}

// =========== FORM VALIDATION ===========
function validateFormAdvanced() {
  const lang = getLang();
  const text = i18n[lang];
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const wilaya = document.getElementById('wilaya').value;
  const commune = document.getElementById('commune').value;
  const deliveryType = document.getElementById('delivery_type').value;

  if (!validateNameAdvanced(name)) { showError(text.errName); document.getElementById('name').focus(); return false; }
  if (!validatePhoneAdvanced(phone)) { showError(text.errPhone); document.getElementById('phone').focus(); return false; }
  if (!wilaya) { showError(text.errWilaya); document.getElementById('wilaya').focus(); return false; }
  if (!commune) { showError(text.errCommune); document.getElementById('commune').focus(); return false; }
  if (!deliveryType) { showError(text.errDelivery); document.getElementById('delivery_type').focus(); return false; }
  return true;
}

// =========== MAIN ORDER HANDLER ===========
async function handleOrderSubmissionSecure(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  if (!submitBtn || submitBtn.disabled) return;

  if (!validateFormAdvanced()) return;

  hideMessages();
  showLoadingState(submitBtn);

  const lang = getLang();
  const originalPrice = parseInt(document.getElementById('productPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const calculateDiscountedPrice = (price, qty) => qty >= 2 ? Math.floor(price * 0.7) : price;
  const finalPrice = calculateDiscountedPrice(originalPrice, quantity);
  const wilayaSelect = document.getElementById('wilaya');
  const wilayaOption = wilayaSelect.options[wilayaSelect.selectedIndex];
  const deliveryType = document.getElementById('delivery_type').value;
  const deliveryPrice = (deliveryType === 'home') ? parseInt(wilayaOption.dataset.homePrice) || 0 : parseInt(wilayaOption.dataset.officePrice) || 0;
  const subtotalPrice = finalPrice * quantity;
  const totalPrice = subtotalPrice + deliveryPrice;

  const order = {
    id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: Date.now(),
    product: document.getElementById('productId').value,
    product_price: originalPrice,
    final_price: finalPrice,
    quantity, subtotal_price: subtotalPrice,
    discount_amount: quantity >= 2 ? (originalPrice * quantity - subtotalPrice) : 0,
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    wilaya: wilayaOption.text,
    commune: document.getElementById('commune').value,
    delivery_type: deliveryType, delivery_price: deliveryPrice, total_price: totalPrice, lang
  };

  const result = await sendOrderSecure(order);

  resetButtonState(submitBtn);

  if (result.success) {
    saveOrderLocally(order);
    try { if (typeof fbq === 'function') fbq('track','Purchase',{ value: totalPrice, currency:'DZD' }); } catch {}
    window.location.href = '/order.html'; // Redirect on success
    return;
  }
  
  // Handle specific errors
  if (result.error === 'rate_limit') {
    showServerRateLimitCountdown(result.ttlMs, result.message);
  } else if (result.error === 'network') {
    showError(i18n[lang].networkError);
  } else if (result.error === 'timeout') {
    showError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
  } else {
    showError(result.message || i18n[lang].errorMessage);
  }
}


// =========== INITIALIZATION AND EVENT LISTENERS (No major changes needed) ===========
document.addEventListener('DOMContentLoaded', async function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  generateSecurityFingerprint();
  await fetchIPSecure();
  
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmissionSecure);

  // All other initializations (slideshow, language, etc.) remain here.
  // ...
  console.log('✅ Dermevia App Initialized (with new rate limit handler)');
});

// ... The rest of your utility, slideshow, and UI functions can remain as they were.