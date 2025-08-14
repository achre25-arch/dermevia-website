'use strict';

// =========== ENHANCED SECURITY CONFIGURATION ===========
const CONFIG = {
  // استبدال Google Apps Script بـ Netlify Functions
  NETLIFY_FUNCTIONS_BASE: '/.netlify/functions',
  SUBMIT_ENDPOINT: '/.netlify/functions/submit-form',
  RATE_LIMIT_ENDPOINT: '/.netlify/functions/validate-rate-limit',
  
  // Rate limiting settings (محسنة للخادم)
  PHONE_COOLDOWN_MS: 12 * 60 * 60 * 1000, // 12 hours
  MAX_ORDERS_PER_PHONE: 2,
  MAX_RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 25000, // 25 seconds for Netlify Functions
  
  // Security settings
  SECURITY_SALT: 'dermevia_2024_secure_salt',
  ENCRYPTION_KEY: 'dermevia_advanced_encryption',
  
  // Client-side validation backup
  FALLBACK_VALIDATION: true,
  DEBUG_MODE: false // Set to true for development
};

// =========== COMMUNES DATA ===========
const communesData = {
  "16": [
    "الجزائر الوسطى", "سيدي أمحمد", "المدنية", "المرادية", "باب الوادي", "القصبة", 
    "بولوغين", "واد قريش", "رايس حميدو", "المقارية", "الحامة", "حسين داي", 
    "القبة", "بن عكنون", "بني مسوس", "بوزريعة", "الأبيار", "بئر مراد رايس", 
    "بئر خادم", "جسر قسنطينة", "حيدرة", "سحاولة", "باش جراح", "بوروبة", 
    "الحراش", "وادي السمار", "عين طاية", "باب الزوار", "برج البحري", 
    "برج الكيفان", "الدار البيضاء", "المرسى", "المحمدية", "عين البنيان", 
    "الشراقة", "دالي ابراهيم", "أولاد فايت", "الحمامات", "المحالمة", 
    "الرحمانية", "السويدانية", "سطاوالي", "زرالدة", "بابا حسن", "دويرة", 
    "الدرارية", "العاشور", "خرايسية", "بئر توتة", "أولاد شبل", "تسالة المرجة", 
    "براقي", "الكاليتوس", "سيدي موسى", "هراوة", "الرغاية", "الرويبة"
  ],
  "31": [
    "وهران", "أرزيو", "العلايمية", "الكرمة", "بئر الجير", "البرية", "بطيوة", 
    "بن فريحة", "بوتليليس", "بوسفر", "بوفاطيس", "حاسي بن عقبة", "حاسي بونيف", 
    "حاسي مفسوخ", "دوار الملح", "السانية", "سيدي الشحمي", "سيدي بن يبقى", 
    "سيق", "طفراوي", "العنصر", "عين البية", "عين الترك", "عين الكرمة", 
    "قديل", "مرسى الحجاج", "المرسى الكبير", "مسرغين", "وادي تليلات"
  ],
  "25": [
    "قسنطينة", "الخروب", "عين سمارة", "أولاد رحمون", "عين عبيد", "ابن باديس", 
    "زيغود يوسف", "بني حميدان", "حامة بوزيان", "ديدوش مراد", "ابن زياد", 
    "مسعود بوجريو"
  ]
};

// =========== TRANSLATIONS (نفس المحتوى السابق) ===========
const i18n = {
  ar: { 
    productBadge: "✨ حصرياً من Dermevia Labs",
    heroTitle: "Dermevia Pureskin",
    heroSubtitle: "منظف الوجه المتطور بالكبريت الطبيعي", 
    heroDescription: "تركيبة علمية متقدمة مُصممة خصيصاً لعلاج البشرة الدهنية وحب الشباب",
    acneText: "🎯 الحل الطبي الأمثل لمحاربة حب الشباب",
    acneSubtext: "تركيبة 1% كبريت مُعتمدة طبياً + خلاصات طبيعية لبشرة صافية ونظيفة",
    ctaButton: "احصلي على Dermevia Pureskin الآن",
    problemTitle: "هل تواجهين مشاكل البشرة هذه؟",
    benefitsTitle: "لماذا Dermevia Pureskin هو الاختيار الأفضل؟",
    benefitsSubtitle: "منتج طبي مُختبر سريرياً يجمع بين قوة الكبريت الطبيعي وفعالية المكونات النشطة",
    guaranteeTitle: "ضمان استرداد الأموال لمدة 15 يوم",
    guaranteeText: "ثقتنا في فعالية Dermevia Pureskin تامة! إذا لم تشعري بالفرق خلال 15 يوماً، احصلي على استرداد 50% من قيمة المنتج فوراً.",
    testimonialsTitle: "آراء عملائنا الحقيقية",
    testimonialsSubtitle: "تجارب فعلية موثقة من وسائل التواصل الاجتماعي",
    finalPriceTitle: "عرض خاص - محدود المدة",
    finalPriceNote: "ضمان 15 يوم + توصيل مجاني لجميع الولايات",
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
    securityError: "⚠️ خطأ أمني. يرجى إعادة تحميل الصفحة",
    networkError: "🌐 مشكلة في الاتصال. يرجى التحقق من الإنترنت",
    serverError: "🔧 مشكلة في الخادم. يرجى المحاولة بعد قليل",
    alreadyTitle: "⚠️ تم تسجيل طلب مسبقاً",
    alreadyText: "يمكنك تقديم طلبين كحد أقصى كل 12 ساعة من نفس الرقم.",
    rateLimitTitle: "⚠️ تم تجاوز الحد المسموح",
    rateLimitText: "يمكنك تقديم طلبين كحد أقصى خلال 12 ساعة. يرجى المحاولة بعد:",
    currency: "دج",
    pieces: "قطعة",
    // Footer translations remain the same...
    footerTagline: "علم العناية بالبشرة الأوروبي المتقدم",
    footerContactTitle: "📞 مصلحة الزبائن",
    footerContactPhone: "+213 770 45 32 10 / +213 555 123 456",
    footerContactHours: "🕐 السبت - الخميس: 9 صباحاً - 6 مساءً",
    footerContactEmail: "✉️ contact@dermevia.dz",
    footerAddressTitle: "📍 الموزع في الجزائر",
    footerAddress1: "Dermevia Algérie EURL",
    footerAddress2: "القطعة 102، المنطقة الصناعية واد السمار، الجزائر",
    footerPoliciesTitle: "📋 سياسات المختبر",
    footerGuaranteeLabel: "🛡️ ضمان الجودة:",
    footerGuaranteeText: "15 يوماً ضمان كامل من تاريخ الشراء",
    footerReturnLabel: "🔄 سياسة الإرجاع:",
    footerReturnText: "يمكن إرجاع المنتج خلال 15 يوماً مع استرداد 50% من القيمة",
    footerShippingLabel: "🚚 الشحن:",
    footerShippingText: "توصيل لجميع ولايات الوطن - التسليم خلال 2-4 أيام عمل",
    footerPaymentLabel: "💳 الدفع:",
    footerPaymentText: "عند الاستلام وبعد فحص طردكم",
    footerAboutTitle: "🔬 نبذة عن Dermevia Labs",
    footerAboutText: "مختبر أوروبي رائد تأسس في سويسرا عام 2003، متخصص في تطوير مستحضرات العناية بالبشرة باستخدام أحدث التقنيات والمكونات الطبيعية الفاخرة. يضم فريقاً من 40+ عالم وباحث من جامعات أوروبية مرموقة. حاصل على 25+ براءة اختراع دولية ومُعتمد من هيئة الأدوية الأوروبية (EMA). منتجاتنا متوفرة في 18 دولة أوروبية وموزعة حصرياً في الجزائر عبر Dermevia Algérie E.",
    footerAchievements: "إنجازاتنا: +2 مليون عميل عالمياً | 20+ سنة خبرة أوروبية | معدل رضا 98%",
    footerCopyright: "© 2024 Dermevia Labs Switzerland - موزع حصرياً في الجزائر عبر Dermevia Algérie EURL",
    footerDesign: "موزع في الجزائر عبر Dermevia Algérie EURL - القطعة 102، المنطقة الصناعية واد السمار، الجزائر",
    galleryTitle: "تفاصيل المنتج"
  },
  
  fr: { 
    productBadge: "✨ Innovation Dermevia Labs",
    heroTitle: "Dermevia Pureskin",
    heroSubtitle: "Nettoyant facial révolutionnaire au soufre", 
    heroDescription: "Formule scientifique avancée spécialement développée pour traiter l'acné et les peaux grasses",
    acneText: "🎯 Solution dermatologique contre l'acné persistante",
    acneSubtext: "Formule 1% soufre certifiée + extraits botaniques pour une peau parfaitement purifiée",
    ctaButton: "Commandez Dermevia Pureskin maintenant",
    problemTitle: "Vous souffrez de ces problèmes cutanés ?",
    benefitsTitle: "Pourquoi choisir Dermevia Pureskin ?",
    benefitsSubtitle: "Dispositif médical testé cliniquement alliant puissance du soufre naturel et efficacité des actifs innovants",
    guaranteeTitle: "Garantie remboursement 15 jours",
    guaranteeText: "Notre confiance en Dermevia Pureskin est totale ! Résultats visibles sous 15 jours ou remboursement de 50% garanti.",
    testimonialsTitle: "Témoignages authentiques",
    testimonialsSubtitle: "Avis vérifiés et collectés sur nos réseaux sociaux",
    finalPriceTitle: "Offre spéciale - Quantités limitées",
    finalPriceNote: "Garantie 15 jours + livraison gratuite toutes wilayas",
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
    successMessage: "✅ Votre commande sécurisée a été enregistrée ! Nous vous contacterons rapidement",
    errorMessage: "❌ Une erreur s'est produite. Veuillez réessayer",
    securityError: "⚠️ Erreur de sécurité. Veuillez recharger la page",
    networkError: "🌐 Problème de connexion. Vérifiez votre internet",
    serverError: "🔧 Problème serveur. Réessayez dans un moment",
    alreadyTitle: "⚠️ Commande déjà enregistrée",
    alreadyText: "Vous pouvez passer 2 commandes maximum toutes les 12h avec ce numéro.",
    rateLimitTitle: "⚠️ Limite de commandes atteinte",
    rateLimitText: "Maximum 2 commandes par 12h autorisées. Réessayez dans:",
    currency: "DA",
    pieces: "unités",
    // Rest of French translations remain the same...
    footerTagline: "Science européenne avancée des soins cutanés",
    footerContactTitle: "📞 Service Client",
    footerContactPhone: "+213 770 45 32 10 / +213 555 123 456",
    footerContactHours: "🕐 Samedi - Jeudi: 9h - 18h",
    footerContactEmail: "✉️ contact@dermevia.dz",
    footerAddressTitle: "📍 Distributeur en Algérie",
    footerAddress1: "Dermevia Algérie EURL",
    footerAddress2: "Lot 102, Zone Industrielle Oued Smar, Alger",
    footerPoliciesTitle: "📋 Politiques du Laboratoire",
    footerGuaranteeLabel: "🛡️ Garantie Qualité:",
    footerGuaranteeText: "15 jours de garantie complète à partir de l'achat",
    footerReturnLabel: "🔄 Politique de Retour:",
    footerReturnText: "Retour possible sous 15 jours avec remboursement de 50% de la valeur",
    footerShippingLabel: "🚚 Livraison:",
    footerShippingText: "Livraison toutes wilayas - Réception sous 2-4 jours ouvrables",
    footerPaymentLabel: "💳 Paiement:",
    footerPaymentText: "À la réception après vérification de votre colis",
    footerAboutTitle: "🔬 À propos de Dermevia Labs",
    footerAboutText: "Laboratoire européen leader fondé en Suisse en 2003, spécialisé dans le développement de produits de soins cutanés utilisant les dernières technologies et ingrédients naturels de luxe. Comprend une équipe de 40+ scientifiques et chercheurs d'universités européennes prestigieuses. Détient 25+ brevets internationaux et agréé par l'Agence européenne des médicaments (EMA). Nos produits sont disponibles dans 18 pays européens et distribués exclusivement en Algérie via Dermevia Algérie EURL.",
    footerAchievements: "Nos réalisations: +2 millions de clients mondiaux | 20+ ans d'expérience européenne | 98% de satisfaction",
    footerCopyright: "© 2024 Dermevia Labs Switzerland - Distribué exclusivement en Algérie via Dermevia Algérie EURL",
    footerDesign: "Distribué en Algérie par Dermevia Algérie EURL - Lot 102, Zone Industrielle Oued Smar, Alger",
    galleryTitle: "Détails du produit"
  }
};

// =========== GLOBAL VARIABLES ===========
let clientIP = null;
let securityFingerprint = null;
let lastOrderAttempt = null;
let serverRateLimitCache = new Map();

// =========== SLIDESHOW VARIABLES ===========
let currentSlideIndex = 0;
let slideInterval;

// =========== MODAL GALLERY VARIABLES ===========
let currentModalImages = [];
let currentModalIndex = 0;

// =========== ENHANCED SECURITY FUNCTIONS ===========
function generateSecurityFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Dermevia Security Check', 2, 2);
    
    const fingerprint = {
      canvas: canvas.toDataURL(),
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 100),
      timestamp: Date.now(),
      webgl: getWebGLFingerprint(),
      fonts: getFontFingerprint()
    };
    
    const fingerprintString = JSON.stringify(fingerprint);
    securityFingerprint = btoa(fingerprintString).substring(0, 32);
    
    return securityFingerprint;
    
  } catch (error) {
    console.warn('Fingerprint generation failed:', error);
    securityFingerprint = 'fallback_' + Date.now();
    return securityFingerprint;
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    return `${vendor}_${renderer}`.substring(0, 50);
  } catch (error) {
    return 'webgl-error';
  }
}

function getFontFingerprint() {
  try {
    const testString = 'mmmmmmmmmlil';
    const testFonts = ['Arial', 'Times New Roman', 'Courier New'];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const baselines = testFonts.map(font => {
      ctx.font = `12px ${font}`;
      return ctx.measureText(testString).width;
    });
    
    return baselines.join(',');
  } catch (error) {
    return 'font-error';
  }
}

function sanitizeInputAdvanced(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

function validatePhoneAdvanced(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length !== 10) return false;
  if (!/^(05|06|07)/.test(cleanPhone)) return false;
  
  const suspiciousPatterns = [
    /^(.)\1{9}$/,
    /^0123456789$/,
    /^0987654321$/,
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(cleanPhone));
}

function validateNameAdvanced(name) {
  if (!name || name.length < 2 || name.length > 100) return false;
  
  const validNamePattern = /^[\u0600-\u06FF\u0750-\u077F\s\u064B-\u0652a-zA-ZÀ-ÿ\-'\.]+$/;
  if (!validNamePattern.test(name)) return false;
  
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length < 1) return false;
  
  const validWords = words.filter(word => word.length >= 2);
  if (validWords.length < 1) return false;
  
  const suspiciousPatterns = [
    /test/i, /admin/i, /null/i, /undefined/i, /script/i, /select/i,
    /drop/i, /delete/i, /insert/i, /update/i, /create/i, /alter/i,
    /^(.)\1+$/, /^\d+$/, /^[^a-zA-Z\u0600-\u06FF]+$/
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(name));
}

// =========== ENHANCED IP FETCHING ===========
async function fetchIPSecure() {
  try {
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.protocol === 'file:';
    
    if (isLocal) {
      clientIP = 'local_' + Date.now().toString(36);
      console.log('🏠 Running locally, using fallback IP');
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
     const response = await fetch('https://api.ipify.org?format=json', {
  signal: controller.signal,
  mode: 'cors',
  headers: {
    'Accept': 'application/json'
  }
});
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        clientIP = data.ip;
        console.log('🌐 Real IP fetched:', clientIP);
      } else {
        throw new Error('IP fetch failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Fallback to alternative service
      try {
        const fallbackResponse = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          clientIP = fallbackData.ip;
          console.log('🌐 Fallback IP fetched:', clientIP);
        } else {
          throw new Error('Fallback failed');
        }
      } catch (fallbackError) {
        clientIP = 'unknown_' + Date.now().toString(36);
        console.warn('IP fetch completely failed, using fallback');
      }
    }
    
  } catch(error) { 
    console.warn('IP fetch error:', error.message);
    clientIP = 'error_' + Date.now().toString(36);
  }
}

// =========== SERVER-SIDE RATE LIMITING ===========
async function checkServerRateLimit(phone) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(CONFIG.RATE_LIMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ phone: phone }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('Rate limit check failed:', response.status);
      return { allowed: true, fallback: true }; // Fail open
    }
    
    const result = await response.json();
    
    if (result.success && result.rateLimit) {
      // Cache result for local validation
      serverRateLimitCache.set(phone, {
        result: result.rateLimit,
        timestamp: Date.now()
      });
      
      return {
        allowed: result.rateLimit.allowed,
        timeLeft: result.rateLimit.timeLeft || 0,
        reason: result.rateLimit.reason,
        counts: result.rateLimit.counts,
        serverValidated: true
      };
    }
    
    return { allowed: true, fallback: true };
    
  } catch (error) {
    console.warn('Rate limit check error:', error);
    return { allowed: true, fallback: true }; // Fail open for UX
  }
}

// =========== LOCAL RATE LIMITING BACKUP ===========
function canOrderByPhoneLocal(phone) {
  try {
    const sanitizedPhone = sanitizeInputAdvanced(phone);
    if (!validatePhoneAdvanced(sanitizedPhone)) return { ok: false, left: 0, reason: 'invalid_phone' };
    
    const phoneKey = 'dermevia_phone_' + btoa(sanitizedPhone + CONFIG.SECURITY_SALT).substring(0, 16);
    const phoneDataJson = localStorage.getItem(phoneKey);
    
    if (!phoneDataJson) return { ok: true, left: 0 };
    
    let phoneData;
    try {
      phoneData = JSON.parse(phoneDataJson);
    } catch (e) {
      return { ok: true, left: 0 };
    }
    
    const now = Date.now();
    const validTimestamps = phoneData.filter(timestamp => (now - timestamp) < CONFIG.PHONE_COOLDOWN_MS);
    
    if (validTimestamps.length !== phoneData.length) {
      localStorage.setItem(phoneKey, JSON.stringify(validTimestamps));
    }
    
    if (validTimestamps.length >= CONFIG.MAX_ORDERS_PER_PHONE) {
      const oldestOrder = Math.min(...validTimestamps);
      const cooldownRemaining = CONFIG.PHONE_COOLDOWN_MS - (now - oldestOrder);
      return { ok: false, left: cooldownRemaining, reason: 'cooldown', count: validTimestamps.length };
    }
    
    return { ok: true, left: 0, count: validTimestamps.length };
      
  } catch(error) { 
    console.warn('Local phone validation error:', error);
    return { ok: true, left: 0, reason: 'error' };
  }
}

function saveOrderAdvanced(phone) { 
  try {
    const sanitizedPhone = sanitizeInputAdvanced(phone);
    const phoneKey = 'dermevia_phone_' + btoa(sanitizedPhone + CONFIG.SECURITY_SALT).substring(0, 16);
    const now = Date.now();
    
    const existingData = localStorage.getItem(phoneKey);
    let timestamps = [];
    
    if (existingData) {
      try {
        timestamps = JSON.parse(existingData);
        if (!Array.isArray(timestamps)) timestamps = [];
      } catch (e) {
        timestamps = [];
      }
    }
    
    timestamps.push(now);
    timestamps = timestamps.filter(ts => (now - ts) < CONFIG.PHONE_COOLDOWN_MS);
    
    localStorage.setItem(phoneKey, JSON.stringify(timestamps));
    
  } catch(error) {
    console.warn('Advanced order save failed:', error);
  }
}

// =========== ENHANCED FORM SUBMISSION ===========
async function sendOrderSecure(data) {
  const maxRetries = CONFIG.MAX_RETRY_ATTEMPTS;
  let attempt = 0;
  
  console.log('📤 Starting secure order submission via Netlify Functions...');
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`🔒 Secure order submission attempt ${attempt}/${maxRetries}`);
      
      const secureData = {
        ...data,
        security_fingerprint: securityFingerprint,
        client_ip: clientIP,
        user_agent: navigator.userAgent.substring(0, 200),
        referer: window.location.href,
        origin: window.location.origin,
        timestamp_client: Date.now(),
        attempt_number: attempt,
        connection_type: navigator.connection?.effectiveType || 'unknown',
        request_id: generateRequestId()
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
      
      const response = await fetch(CONFIG.SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(secureData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Order submitted successfully via Netlify Functions');
        return { success: true, data: result };
      } else {
        throw new Error(result.error || 'Server returned error');
      }
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        if (attempt === maxRetries) {
          return { success: false, error: 'timeout', message: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' };
        }
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        if (attempt === maxRetries) {
          return { success: false, error: 'network', message: 'مشكلة في الاتصال. يرجى التحقق من الإنترنت.' };
        }
      } else if (error.message.includes('HTTP 429')) {
        return { success: false, error: 'rate_limit', message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.' };
      } else if (error.message.includes('HTTP 400')) {
        return { success: false, error: 'validation', message: 'بيانات غير صحيحة. يرجى التحقق من المعلومات.' };
      } else {
        if (attempt === maxRetries) {
          return { success: false, error: 'server', message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.' };
        }
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  return { success: false, error: 'max_retries', message: 'فشل في الإرسال بعد عدة محاولات' };
}

function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// =========== ENHANCED ORDER HANDLER ===========
async function handleOrderSubmissionSecure(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  if (!submitBtn || submitBtn.disabled) return;

  try {
    const phone = document.getElementById('phone').value.trim();
    
    // Client-side validation first
    if (!validateFormAdvanced()) return;
    
    hideMessages();
    showLoadingState(submitBtn);

    console.log('🔍 Checking server-side rate limiting...');
    
    // Check server-side rate limiting
    const rateLimitResult = await checkServerRateLimit(phone);
    
    if (!rateLimitResult.allowed && !rateLimitResult.fallback) {
      console.warn('❌ Server rate limit exceeded:', rateLimitResult);
      resetButtonState(submitBtn);
      
      if (rateLimitResult.reason === 'hourly_limit') {
        showRateLimitMessage(rateLimitResult.timeLeft, rateLimitResult.counts?.hourly || 0);
      } else if (rateLimitResult.reason === 'daily_limit') {
        showDailyLimitMessage(rateLimitResult.timeLeft, rateLimitResult.counts?.daily || 0);
      } else {
        showRateLimitMessage(rateLimitResult.timeLeft || 0, 0);
      }
      return;
    }
    
    // Fallback to local validation if server check failed
    if (rateLimitResult.fallback) {
      console.log('⚠️ Using local rate limiting fallback');
      const localCheck = canOrderByPhoneLocal(phone);
      if (!localCheck.ok) {
        resetButtonState(submitBtn);
        showRateLimitMessage(localCheck.left, localCheck.count || 0);
        return;
      }
    }

    console.log('✅ Rate limit check passed, processing order...');

    const lang = getLang();
    const originalPrice = parseInt(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const finalPrice = calculateDiscountedPrice(originalPrice, quantity);
    const wilayaSelect = document.getElementById('wilaya');
    const wilayaOption = wilayaSelect.options[wilayaSelect.selectedIndex];
    const deliveryType = document.getElementById('delivery_type').value;
    
    const deliveryPrice = (deliveryType === 'home') 
      ? parseInt(wilayaOption.dataset.homePrice) || 0
      : parseInt(wilayaOption.dataset.officePrice) || 0;
    
    const subtotalPrice = finalPrice * quantity;
    const totalPrice = subtotalPrice + deliveryPrice;
    const discountAmount = quantity >= 2 ? (originalPrice * quantity - subtotalPrice) : 0;
    
    const order = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now(),
      product: document.getElementById('productId').value,
      product_price: originalPrice,
      final_price: finalPrice,
      quantity: quantity,
      subtotal_price: subtotalPrice,
      discount_amount: discountAmount,
      discount_percentage: quantity >= 2 ? 30 : 0,
      name: document.getElementById('name').value.trim(),
      phone: phone,
      wilaya: wilayaOption.text,
      commune: document.getElementById('commune').value,
      delivery_type: deliveryType,
      delivery_price: deliveryPrice,
      total_price: totalPrice,
      lang: lang,
      client_ip: clientIP || 'unknown',
      // Enhanced data for server processing
      security_data: {
        fingerprint: securityFingerprint,
        form_start_time: window.formStartTime,
        submission_time: Date.now(),
        page_load_time: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      }
    };
    
    console.log('📦 Submitting order:', order.id);
    
    const result = await sendOrderSecure(order);
    
    if (result.success) {
      console.log('🎉 Order submitted successfully!');
      
      // Save order locally and update rate limiting
      saveOrderAdvanced(phone);
      saveOrderLocally(order);
      
      submitBtn.textContent = '✅ تم الإرسال بنجاح';
      submitBtn.style.background = '#10b981';
      showSuccess(i18n[lang].successMessage);
      
      // Track successful conversion
      try {
        if (typeof fbq === 'function') {
          fbq('track', 'Purchase', {
            value: totalPrice / 100,
            currency: 'USD',
            content_name: order.product,
            content_ids: [order.id],
            content_type: 'product',
            num_items: quantity
          });
        }
      } catch (e) {
        console.warn('Facebook Pixel tracking failed:', e);
      }
      
      setTimeout(() => {
        createThankYouPage(order);
      }, 1500);
    } else {
      console.error('❌ Order submission failed:', result);
      resetButtonState(submitBtn);
      
      const lang = getLang();
      let errorMessage = i18n[lang].errorMessage;
      
      if (result.error === 'network') {
        errorMessage = i18n[lang].networkError;
      } else if (result.error === 'timeout') {
        errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
      } else if (result.error === 'rate_limit') {
        errorMessage = 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.';
      } else if (result.error === 'validation') {
        errorMessage = 'بيانات غير صحيحة. يرجى التحقق من المعلومات.';
      } else if (result.error === 'server') {
        errorMessage = i18n[lang].serverError;
      }
      
      showError(errorMessage);
    }
    
  } catch (error) {
    console.error('Order submission error:', error);
    resetButtonState(submitBtn);
    showError(i18n[getLang()].errorMessage);
  }
}

// =========== REST OF THE FUNCTIONS (نفس المحتوى السابق) ===========
// تبقى جميع الوظائف الأخرى كما هي مع بعض التحسينات الطفيفة

// =========== SLIDESHOW FUNCTIONALITY (نفس المحتوى) ===========
function initSlideshow() {
  console.log('🖼️ Initializing slideshow...');
  
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) {
    console.warn('No slides found');
    return;
  }
  
  startAutoSlide();
  
  const slideshowContainer = document.querySelector('.slideshow-container');
  if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
    slideshowContainer.addEventListener('mouseleave', startAutoSlide);
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
      changeSlide(1);
    }
  });
  
  console.log('✅ Slideshow initialized with', slides.length, 'slides');
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0) return;
  
  slides.forEach(slide => {
    slide.classList.remove('active');
  });
  
  dots.forEach(dot => {
    dot.classList.remove('active');
  });
  
  if (slides[index]) {
    slides[index].classList.add('active');
  }
  
  if (dots[index]) {
    dots[index].classList.add('active');
  }
  
  currentSlideIndex = index;
}

function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  
  let newIndex = currentSlideIndex + direction;
  
  if (newIndex >= slides.length) {
    newIndex = 0;
  } else if (newIndex < 0) {
    newIndex = slides.length - 1;
  }
  
  showSlide(newIndex);
  
  if (slideInterval) {
    clearInterval(slideInterval);
    startAutoSlide();
  }
}

function currentSlide(index) {
  showSlide(index - 1);
  
  if (slideInterval) {
    clearInterval(slideInterval);
    startAutoSlide();
  }
}

function startAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
  
  slideInterval = setInterval(() => {
    changeSlide(1);
  }, 4000);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

// =========== MODAL GALLERY (نفس المحتوى) ===========
function openModal(imageSrc) {
  currentModalImages = [
   'https://via.placeholder.com/800x600/009fe3/ffffff?text=Dermevia+1',
  'https://via.placeholder.com/800x600/10b981/ffffff?text=Dermevia+2', 
  'https://via.placeholder.com/800x600/6366f1/ffffff?text=Dermevia+3',
  'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Dermevia+4'
];
  
  currentModalIndex = currentModalImages.indexOf(imageSrc);
  if (currentModalIndex === -1) currentModalIndex = 0;
  
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  
  if (modal && modalImage) {
    modalImage.src = imageSrc;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function modalPrev() {
  currentModalIndex = currentModalIndex > 0 ? currentModalIndex - 1 : currentModalImages.length - 1;
  const modalImage = document.getElementById('modalImage');
  if (modalImage) {
    modalImage.src = currentModalImages[currentModalIndex];
  }
}

function modalNext() {
  currentModalIndex = currentModalIndex < currentModalImages.length - 1 ? currentModalIndex + 1 : 0;
  const modalImage = document.getElementById('modalImage');
  if (modalImage) {
    modalImage.src = currentModalImages[currentModalIndex];
  }
}

// =========== IMAGE HANDLING (نفس المحتوى) ===========
function handleImageError(img) {
  console.warn('Image failed to load:', img.src);
  
  const fallbackDiv = document.createElement('div');
  fallbackDiv.className = 'image-fallback';
  fallbackDiv.style.cssText = `
    width: ${img.offsetWidth || 200}px;
    height: ${img.offsetHeight || 150}px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px dashed #dee2e6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-size: 14px;
    font-weight: 600;
    border-radius: ${window.getComputedStyle(img).borderRadius || '8px'};
  `;
  fallbackDiv.textContent = '📷 ' + (img.alt || 'صورة المنتج');
  
  if (img.parentNode) {
    img.parentNode.replaceChild(fallbackDiv, img);
  }
}

function initImageFallbacks() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
    
    if (!img.complete && img.src) {
      img.addEventListener('load', () => {
        console.log('✅ Image loaded successfully:', img.src);
      });
    }
  });
}

function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window && images.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

// =========== FORM VALIDATION (نفس المحتوى مع تحسينات) ===========
function validateFormAdvanced() {
  const lang = getLang();
  const text = i18n[lang];
  
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const wilaya = document.getElementById('wilaya').value;
  const commune = document.getElementById('commune').value;
  const deliveryType = document.getElementById('delivery_type').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  
  if (!validateNameAdvanced(name)) { 
    showError(text.errName + ' (يمكن أن يكون الاسم الأول فقط)'); 
    setTimeout(() => document.getElementById('name').focus(), 200);
    return false; 
  }
  
  if (!validatePhoneAdvanced(phone)) { 
    showError(text.errPhone + ' (يجب أن يكون رقماً جزائرياً صحيحاً)');
    setTimeout(() => document.getElementById('phone').focus(), 200);
    return false; 
  }
  
  if (!quantity || quantity < 1 || quantity > 10) { 
    showError('يرجى اختيار كمية صحيحة (1-10)');
    return false; 
  }
  
  if (!wilaya) {
    showError(text.errWilaya);
    setTimeout(() => document.getElementById('wilaya').focus(), 200);
    return false;
  }
  
  if (!commune) {
    showError(text.errCommune);
    setTimeout(() => document.getElementById('commune').focus(), 200);
    return false;
  }
  
  if (!deliveryType || !['home', 'office'].includes(deliveryType)) {
    showError(text.errDelivery);
    setTimeout(() => document.getElementById('delivery_type').focus(), 200);
    return false;
  }
  
  return true;
}

// =========== UTILITY FUNCTIONS (نفس المحتوى) ===========
function setLang(lang) { 
  localStorage.setItem('dermevia_lang', lang); 
}

function getLang() { 
  return localStorage.getItem('dermevia_lang') || 'ar'; 
}

function formatCurrency(value) { 
  return value + ' ' + i18n[getLang()].currency; 
}

function formatTimeLeft(ms) {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}

function calculateDiscountedPrice(originalPrice, quantity) {
  if (quantity >= 2) return Math.floor(originalPrice * 0.7);
  return originalPrice;
}

function saveOrderLocally(order) {
  try {
    const orders = JSON.parse(localStorage.getItem('dermevia_orders') || '[]');
    orders.unshift(order);
    
    if (orders.length > 10) {
      orders.splice(10);
    }
    
    localStorage.setItem('dermevia_orders', JSON.stringify(orders));
    localStorage.setItem('dermevia_last_order', JSON.stringify(order));
    console.log('💾 Order saved locally');
  } catch(e) {
    console.warn('Local storage save failed:', e);
  }
}

// =========== UI FUNCTIONS (نفس المحتوى) ===========
// ... [باقي الوظائف تبقى نفسها] ...

// =========== ENHANCED MESSAGE FUNCTIONS ===========
function showRateLimitMessage(timeLeft, count) {
  const lang = getLang();
  const text = i18n[lang];
  hideMessages();
  
  const alreadyBox = document.getElementById('alreadyBox');
  const alreadyTitle = document.getElementById('alreadyTitle');
  const alreadyText = document.getElementById('alreadyText');
  
  if (alreadyTitle) alreadyTitle.textContent = text.rateLimitTitle;
  if (alreadyText) alreadyText.textContent = `تم الوصول لحد الطلبين خلال 12 ساعة. يرجى المحاولة بعد: ${formatTimeLeft(timeLeft)}`;
  if (alreadyBox) alreadyBox.style.display = 'block';
  
  setTimeout(() => {
    alreadyBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function showDailyLimitMessage(timeLeft, count) {
  const lang = getLang();
  hideMessages();
  
  const rateLimitBox = document.getElementById('rateLimitBox');
  const rateLimitTitle = document.getElementById('rateLimitTitle');
  const rateLimitText = document.getElementById('rateLimitText');
  const timeLeftElement = document.getElementById('timeLeft');
  
  if (rateLimitTitle) rateLimitTitle.textContent = `⚠️ تم الوصول للحد اليومي (${count}/10)`;
  if (rateLimitText) rateLimitText.textContent = 'يرجى المحاولة بعد:';
  if (timeLeftElement) timeLeftElement.textContent = formatTimeLeft(timeLeft);
  if (rateLimitBox) rateLimitBox.style.display = 'block';
  
  setTimeout(() => {
    rateLimitBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// =========== REST OF FUNCTIONS (نفس المحتوى) ===========
// ... باقي الوظائف تبقى نفسها مع التحسينات اللازمة ...

function showOrderForm() {
  const orderCard = document.getElementById('orderCard');
  if (orderCard) {
    orderCard.style.display = 'block';
    orderCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  window.formStartTime = Date.now();
  
  setTimeout(() => {
    toggleFloatingCTA();
  }, 100);
  
  try {
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        value: parseInt(document.getElementById('productPrice').value) / 100,
        currency: 'USD',
        content_name: document.getElementById('productId').value
      });
    }
  } catch(e) {}
}

function populateCommunes(wilayaCode) {
  const communeSelect = document.getElementById('commune');
  const lang = getLang();
  const text = i18n[lang];
  
  if (communeSelect) {
    communeSelect.innerHTML = '<option value="">' + text.selectCommune + '</option>';
    
    if (wilayaCode && communesData[wilayaCode]) {
      communesData[wilayaCode].forEach(function(commune) {
        const option = document.createElement('option');
        option.value = commune;
        option.textContent = commune;
        communeSelect.appendChild(option);
      });
    }
  }
}

function updateQuantity(newQuantity) {
  const minQty = 1, maxQty = 10;
  newQuantity = Math.max(minQty, Math.min(maxQty, newQuantity));
  
  const quantityInput = document.getElementById('quantity');
  const quantityDisplay = document.getElementById('headerQuantityDisplay');
  const decreaseBtn = document.getElementById('headerDecreaseBtn');
  const increaseBtn = document.getElementById('headerIncreaseBtn');
  
  if (quantityInput) quantityInput.value = newQuantity;
  if (quantityDisplay) quantityDisplay.textContent = newQuantity;
  if (decreaseBtn) decreaseBtn.disabled = (newQuantity <= minQty);
  if (increaseBtn) increaseBtn.disabled = (newQuantity >= maxQty);
  
  updateHeaderPrice();
  updatePriceDisplay();
  updateFloatingCTA();
}

function updateHeaderPrice() {
  const lang = getLang();
  const originalPrice = parseInt(document.getElementById('productPrice').value) || 0;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const priceOnlyPill = document.getElementById('priceOnlyPill');
  
  if (priceOnlyPill) {
    if (quantity >= 2) {
      const discountedPrice = calculateDiscountedPrice(originalPrice, quantity);
      const totalAfterDiscount = discountedPrice * quantity;
      priceOnlyPill.innerHTML = `سعر القطعة: <strike>${formatCurrency(originalPrice)}</strike> ${formatCurrency(discountedPrice)} × ${quantity} = ${formatCurrency(totalAfterDiscount)} <span class="discount-badge">خصم 30%</span>`;
    } else if (quantity > 1) {
      const subtotalPrice = originalPrice * quantity;
      priceOnlyPill.textContent = `سعر القطعة: ${formatCurrency(originalPrice)} × ${quantity} = ${formatCurrency(subtotalPrice)}`;
    } else {
      priceOnlyPill.textContent = `سعر القطعة: ${formatCurrency(originalPrice)}`;
    }
  }
}

function updatePriceDisplay() {
  const originalPrice = parseInt(document.getElementById('productPrice').value) || 0;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const wilayaSelect = document.getElementById('wilaya');
  const deliveryType = document.getElementById('delivery_type').value;
  const priceDisplay = document.getElementById('priceDisplay');
  
  if (!priceDisplay || !wilayaSelect) return;
  
  let deliveryPrice = null;
  
  if (wilayaSelect.selectedIndex > 0 && deliveryType) {
    const option = wilayaSelect.options[wilayaSelect.selectedIndex];
    deliveryPrice = (deliveryType === 'home') ? parseInt(option.dataset.homePrice) || 0 : parseInt(option.dataset.officePrice) || 0;
  }
  
  if (deliveryPrice !== null) {
    const finalPrice = calculateDiscountedPrice(originalPrice, quantity);
    const subtotalPrice = finalPrice * quantity;
    const totalPrice = subtotalPrice + deliveryPrice;
    
    let priceHtml = '';
    if (quantity >= 2) {
      const originalSubtotal = originalPrice * quantity;
      priceHtml = `سعر المنتج: ${formatCurrency(originalPrice)} × ${quantity} = <strike>${formatCurrency(originalSubtotal)}</strike> | بعد الخصم: ${formatCurrency(subtotalPrice)} (خصم 30%) | تكلفة التوصيل: ${formatCurrency(deliveryPrice)} | <span style="color:#009fe3; font-size: 1.2em;">إجمالي الفاتورة: ${formatCurrency(totalPrice)}</span>`;
    } else {
      priceHtml = `سعر المنتج: ${formatCurrency(originalPrice)} × ${quantity} = ${formatCurrency(subtotalPrice)} | تكلفة التوصيل: ${formatCurrency(deliveryPrice)} | <span style="color:#009fe3; font-size: 1.2em;">إجمالي الفاتورة: ${formatCurrency(totalPrice)}</span>`;
    }
    
    priceDisplay.innerHTML = priceHtml;
    priceDisplay.style.display = 'block';
  } else {
    priceDisplay.style.display = 'none';
  }
}

function updateFloatingCTA() {
  const lang = getLang();
  const floatingCTAText = document.getElementById('floatingCTAText');
  
  if (floatingCTAText) {
    if (lang === 'ar') {
      floatingCTAText.textContent = "اطلبي Dermevia Pureskin بأمان";
    } else {
      floatingCTAText.textContent = "Commandez Dermevia Pureskin en sécurité";
    }
  }
}

function toggleFloatingCTA() {
  const floatingCTA = document.getElementById('floatingCTA');
  const orderCard = document.getElementById('orderCard');
  
  if (!floatingCTA || !orderCard) return;
  
  const orderCardRect = orderCard.getBoundingClientRect();
  const isOrderCardVisible = orderCardRect.top < window.innerHeight && orderCardRect.bottom > 0;
  
  if (isOrderCardVisible || orderCard.style.display === 'block') {
    floatingCTA.classList.add('hidden');
  } else {
    floatingCTA.classList.remove('hidden');
  }
}

function showError(message) {
  const errorBox = document.getElementById('errorBox');
  const successBox = document.getElementById('successBox');
  const alreadyBox = document.getElementById('alreadyBox');
  const rateLimitBox = document.getElementById('rateLimitBox');
  
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }
  
  if (successBox) successBox.style.display = 'none';
  if (alreadyBox) alreadyBox.style.display = 'none';
  if (rateLimitBox) rateLimitBox.style.display = 'none';
  
  setTimeout(() => {
    errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function showSuccess(message) {
  const errorBox = document.getElementById('errorBox');
  const successBox = document.getElementById('successBox');
  const alreadyBox = document.getElementById('alreadyBox');
  const rateLimitBox = document.getElementById('rateLimitBox');
  
  if (successBox) {
    successBox.textContent = message;
    successBox.style.display = 'block';
  }
  
  if (errorBox) errorBox.style.display = 'none';
  if (alreadyBox) alreadyBox.style.display = 'none';
  if (rateLimitBox) rateLimitBox.style.display = 'none';
  
  setTimeout(() => {
    successBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function hideMessages() {
  const errorBox = document.getElementById('errorBox');
  const successBox = document.getElementById('successBox');
  const alreadyBox = document.getElementById('alreadyBox');
  const rateLimitBox = document.getElementById('rateLimitBox');
  
  if (errorBox) errorBox.style.display = 'none';
  if (successBox) successBox.style.display = 'none';
  if (alreadyBox) alreadyBox.style.display = 'none';
  if (rateLimitBox) rateLimitBox.style.display = 'none';
}

function showLoadingState(button) {
  if (!button) return;
  
  button.disabled = true;
  button.classList.add('loading');
  button.dataset.originalText = button.textContent;
  
  const lang = getLang();
  let dots = '';
  const loadingText = lang === 'ar' ? 'معالجة آمنة' : 'Traitement sécurisé';
  
  const interval = setInterval(() => {
    dots = dots.length >= 3 ? '' : dots + '.';
    button.textContent = loadingText + dots;
  }, 500);
  
  button.dataset.loadingInterval = interval;
}

function resetButtonState(button) {
  if (!button) return;
  
  const interval = button.dataset.loadingInterval;
  if (interval) {
    clearInterval(parseInt(interval));
  }
  
  button.disabled = false;
  button.classList.remove('loading');
  
  const lang = getLang();
  button.textContent = button.dataset.originalText || (lang === 'ar' ? 'تأكيد الطلب الآمن مع الضمان' : 'Confirmer la commande sécurisée avec garantie');
  button.style.background = 'linear-gradient(135deg, #009fe3, #0086c7)';
}

// =========== CREATE THANK YOU PAGE (نفس المحتوى) ===========
function createThankYouPage(order) {
  const lang = getLang();
  
  document.body.innerHTML = `
    <div class="thank-you-page">
      <div class="thank-you-container">
        <div class="thank-you-header">
          <div class="success-icon">🎉</div>
          <h1>${lang === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Commande envoyée avec succès!'}</h1>
          <p class="thank-you-subtitle">
            ${lang === 'ar' ? 'شكراً لاختيارك Dermevia Pureskin' : 'Merci d\'avoir choisi Dermevia Pureskin'}
          </p>
        </div>

        <div class="order-summary-card">
          <h2>${lang === 'ar' ? '📋 ملخص طلبك' : '📋 Résumé de votre commande'}</h2>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'رقم الطلب:' : 'Numéro de commande:'}</span>
              <span class="value">#${order.id}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'الاسم:' : 'Nom:'}</span>
              <span class="value">${order.name}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'رقم الهاتف:' : 'Téléphone:'}</span>
              <span class="value">${order.phone}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'العنوان:' : 'Adresse:'}</span>
              <span class="value">${order.commune}, ${order.wilaya}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'المنتج:' : 'Produit:'}</span>
              <span class="value">Dermevia Pureskin × ${order.quantity}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'سعر المنتج:' : 'Prix produit:'}</span>
              <span class="value">${order.subtotal_price} ${lang === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            
            ${order.discount_amount > 0 ? `
            <div class="detail-row discount">
              <span class="label">${lang === 'ar' ? 'خصم 30%:' : 'Remise 30%:'}</span>
              <span class="value">-${order.discount_amount} ${lang === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <span class="label">${lang === 'ar' ? 'التوصيل:' : 'Livraison:'}</span>
              <span class="value">${order.delivery_price} ${lang === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            
            <div class="detail-row total">
              <span class="label">${lang === 'ar' ? 'المجموع الكلي:' : 'Total général:'}</span>
              <span class="value">${order.total_price} ${lang === 'ar' ? 'دج' : 'DA'}</span>
            </div>
          </div>
        </div>

        <div class="next-steps">
          <h3>${lang === 'ar' ? '📞 الخطوات التالية' : '📞 Prochaines étapes'}</h3>
          <ul>
            <li>${lang === 'ar' ? 'سنتواصل معك خلال 24 ساعة لتأكيد الطلب' : 'Nous vous contacterons dans les 24h pour confirmer'}</li>
            <li>${lang === 'ar' ? 'التوصيل خلال 2-4 أيام عمل' : 'Livraison sous 2-4 jours ouvrables'}</li>
            <li>${lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</li>
            <li>${lang === 'ar' ? 'ضمان 15 يوم لاسترداد 50% من القيمة' : 'Garantie 15 jours pour remboursement 50%'}</li>
          </ul>
        </div>

        <div class="contact-info">
          <p><strong>${lang === 'ar' ? 'للاستفسار:' : 'Pour toute question:'}</strong></p>
          <p>📱 +213 770 45 32 10</p>
          <p>✉️ contact@dermevia.dz</p>
        </div>

        <button class="back-home-btn" onclick="window.location.reload()">
          ${lang === 'ar' ? '🏠 العودة للصفحة الرئيسية' : '🏠 Retour à l\'accueil'}
        </button>
      </div>
    </div>

    <style>
      .thank-you-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Tajawal', sans-serif;
      }
      
      .thank-you-container {
        max-width: 600px;
        width: 100%;
        text-align: center;
      }
      
      .thank-you-header {
        background: white;
        padding: 40px 20px;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .success-icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }
      
      .thank-you-header h1 {
        color: #10b981;
        font-size: 2rem;
        margin-bottom: 10px;
        font-weight: 800;
      }
      
      .thank-you-subtitle {
        color: #666;
        font-size: 1.1rem;
      }
      
      .order-summary-card {
        background: white;
        padding: 30px 20px;
        text-align: right;
        direction: ${lang === 'ar' ? 'rtl' : 'ltr'};
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .order-summary-card h2 {
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
        font-weight: 700;
      }
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      
      .detail-row.discount {
        color: #10b981;
        font-weight: 600;
      }
      
      .detail-row.total {
        font-weight: 800;
        font-size: 1.2rem;
        color: #009fe3;
        border-bottom: none;
        border-top: 2px solid #009fe3;
        margin-top: 10px;
        padding-top: 15px;
      }
      
      .next-steps {
        background: white;
        padding: 30px 20px;
        text-align: ${lang === 'ar' ? 'right' : 'left'};
        direction: ${lang === 'ar' ? 'rtl' : 'ltr'};
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .next-steps h3 {
        color: #1a202c;
        margin-bottom: 15px;
        font-weight: 700;
      }
      
      .next-steps ul {
        list-style: none;
        padding: 0;
      }
      
      .next-steps li {
        padding: 8px 0;
        padding-${lang === 'ar' ? 'right' : 'left'}: 20px;
        position: relative;
      }
      
      .next-steps li::before {
        content: '✅';
        position: absolute;
        ${lang === 'ar' ? 'right' : 'left'}: 0;
      }
      
      .contact-info {
        background: white;
        padding: 20px;
        border-radius: 0 0 20px 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        margin-bottom: 30px;
      }
      
      .contact-info p {
        margin: 5px 0;
        color: #374151;
      }
      
      .back-home-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(16,185,129,0.4);
      }
      
      .back-home-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(16,185,129,0.5);
      }
      
      @media (max-width: 640px) {
        .thank-you-page {
          padding: 10px;
        }
        
        .thank-you-header {
          padding: 30px 15px;
        }
        
        .thank-you-header h1 {
          font-size: 1.5rem;
        }
        
        .order-summary-card, .next-steps, .contact-info {
          padding: 20px 15px;
        }
      }
    </style>
  `;
}

// =========== LANGUAGE SWITCHING (نفس المحتوى) ===========
function switchLanguage(lang) {
  console.log('🌐 Switching language to:', lang);
  
  setLang(lang);
  const html = document.documentElement;
  const body = document.getElementById('body');
  
  html.lang = lang;
  html.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  if (body) body.className = (lang === 'ar') ? 'rtl' : 'ltr';
  
  const arBtn = document.getElementById('ar-btn');
  const frBtn = document.getElementById('fr-btn');
  
  if (arBtn) arBtn.classList.toggle('active', lang === 'ar');
  if (frBtn) frBtn.classList.toggle('active', lang === 'fr');
  
  const text = i18n[lang];
  
  document.querySelectorAll('[data-ar]').forEach(el => {
    if (lang === 'ar' && el.getAttribute('data-ar')) {
      el.textContent = el.getAttribute('data-ar');
    } else if (lang === 'fr' && el.getAttribute('data-fr')) {
      el.textContent = el.getAttribute('data-fr');
    }
  });
  
  const elementsToUpdate = {
    'productBadge': text.productBadge,
    'heroTitle': text.heroTitle,
    'heroSubtitle': text.heroSubtitle,
    'heroDescription': text.heroDescription,
    'acneText': text.acneText,
    'acneSubtext': text.acneSubtext,
    'ctaButton': text.ctaButton,
    'problemTitle': text.problemTitle,
    'benefitsTitle': text.benefitsTitle,
    'benefitsSubtitle': text.benefitsSubtitle,
    'guaranteeTitle': text.guaranteeTitle,
    'guaranteeText': text.guaranteeText,
    'testimonialsTitle': text.testimonialsTitle,
    'testimonialsSubtitle': text.testimonialsSubtitle,
    'finalPriceTitle': text.finalPriceTitle,
    'finalPriceNote': text.finalPriceNote,
    'orderTitle': text.orderTitle,
    'quantityHeaderLabel': text.quantityHeaderLabel,
    'nameLabel': text.nameLabel,
    'phoneLabel': text.phoneLabel,
    'wilayaLabel': text.wilayaLabel,
    'communeLabel': text.communeLabel,
    'deliveryTypeLabel': text.deliveryTypeLabel,
    'galleryTitle': text.galleryTitle
  };
  
  Object.entries(elementsToUpdate).forEach(([elementId, textValue]) => {
    const element = document.getElementById(elementId);
    if (element && textValue) {
      if (element.tagName === 'LABEL') {
        element.innerHTML = textValue;
      } else {
        element.textContent = textValue;
      }
    }
  });

  const selectElements = {
    'selectWilaya': text.selectWilaya,
    'selectCommune': text.selectCommune,
    'selectDelivery': text.selectDelivery,
    'homeText': text.homeText,
    'officeText': text.officeText,
    'submitBtn': text.confirm
  };
  
  Object.entries(selectElements).forEach(([elementId, textValue]) => {
    const element = document.getElementById(elementId);
    if (element && textValue) {
      element.textContent = textValue;
    }
  });

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  
  if (nameInput) {
    nameInput.placeholder = lang === 'ar' ? 'الاسم الأول (واللقب اختياري)' : 'Prénom (nom optionnel)';
  }
  if (phoneInput) {
    phoneInput.placeholder = lang === 'ar' ? '0555123456' : '0555123456';
  }
  
  const footerElements = {
    'footerTagline': text.footerTagline,
    'footerContactTitle': text.footerContactTitle,
    'footerContactPhone': text.footerContactPhone,
    'footerContactHours': text.footerContactHours,
    'footerContactEmail': text.footerContactEmail,
    'footerAddressTitle': text.footerAddressTitle,
    'footerAddress1': text.footerAddress1,
    'footerAddress2': text.footerAddress2,
    'footerPoliciesTitle': text.footerPoliciesTitle,
    'footerGuaranteeLabel': text.footerGuaranteeLabel,
    'footerGuaranteeText': text.footerGuaranteeText,
    'footerReturnLabel': text.footerReturnLabel,
    'footerReturnText': text.footerReturnText,
    'footerShippingLabel': text.footerShippingLabel,
    'footerShippingText': text.footerShippingText,
    'footerPaymentLabel': text.footerPaymentLabel,
    'footerPaymentText': text.footerPaymentText,
    'footerAboutTitle': text.footerAboutTitle,
    'footerAboutText': text.footerAboutText,
    'footerAchievements': text.footerAchievements,
    'footerCopyright': text.footerCopyright,
    'footerDesign': text.footerDesign
  };
  
  Object.entries(footerElements).forEach(([elementId, textValue]) => {
    const element = document.getElementById(elementId);
    if (element && textValue) {
      element.textContent = textValue;
    }
  });
  
  const arTestimonials = document.querySelectorAll('.ar-testimonial');
  const frTestimonials = document.querySelectorAll('.fr-testimonial');
  
  if (lang === 'ar') {
    arTestimonials.forEach(el => el.style.display = 'block');
    frTestimonials.forEach(el => el.style.display = 'none');
  } else {
    arTestimonials.forEach(el => el.style.display = 'none');
    frTestimonials.forEach(el => el.style.display = 'block');
  }
  
  updateSlideshowForLanguage(lang);
  updateHeaderPrice();
  updatePriceDisplay();
  updateFloatingCTA();
  
  console.log('✅ Language switched to:', lang);
}

function updateSlideshowForLanguage(lang) {
  const captions = document.querySelectorAll('.slide-caption');
  
  const arabicCaptions = [
    'منظف الوجه بالكبريت الطبيعي',
    'مكونات طبيعية 100%',
    'نتائج مضمونة خلال أسبوعين',
    'سهل الاستخدام - مرتين يومياً'
  ];
  
  const frenchCaptions = [
    'Nettoyant facial au soufre naturel',
    'Ingrédients 100% naturels',
    'Résultats garantis en deux semaines',
    'Facile à utiliser - deux fois par jour'
  ];
  
  captions.forEach((caption, index) => {
    if (lang === 'ar') {
      caption.textContent = arabicCaptions[index] || '';
    } else {
      caption.textContent = frenchCaptions[index] || '';
    }
  });
}

function trackViewContent() {
  try {
    if (typeof fbq === 'function') {
      const productId = document.getElementById('productId');
      const productPrice = document.getElementById('productPrice');
      
      if (productId && productPrice) {
        fbq('track', 'ViewContent', {
          content_name: productId.value,
          content_type: 'product',
          value: parseInt(productPrice.value) / 100,
          currency: 'USD'
        });
        console.log('📊 Facebook Pixel ViewContent tracked');
      }
    }
  } catch(e) {
    console.warn('Facebook Pixel ViewContent failed:', e);
  }
}

// =========== MAIN INITIALIZATION (محسن) ===========
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Dermevia Secure App Loading with Netlify Functions...');
  
  // Security measures
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
    }
  });
  
  // Initialize security
  generateSecurityFingerprint();
  await fetchIPSecure();
  
  // Initialize features
  initImageFallbacks();
  
  if ('IntersectionObserver' in window) {
    lazyLoadImages();
  }
  
  initSlideshow();
  
  // Main CTA buttons
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
      e.preventDefault();
      showOrderForm();
    });
  }
  
  const floatingCTABtn = document.getElementById('floatingCTABtn');
  if (floatingCTABtn) {
    floatingCTABtn.addEventListener('click', function(e) {
      e.preventDefault();
      showOrderForm();
    });
  }
  
  // Language switching
  const arBtn = document.getElementById('ar-btn');
  const frBtn = document.getElementById('fr-btn');
  
  if (arBtn) arBtn.addEventListener('click', () => switchLanguage('ar'));
  if (frBtn) frBtn.addEventListener('click', () => switchLanguage('fr'));
  
  // Quantity buttons
  const decreaseBtn = document.getElementById('headerDecreaseBtn');
  const increaseBtn = document.getElementById('headerIncreaseBtn');
  
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', function() {
      const currentQty = parseInt(document.getElementById('quantity').value) || 1;
      updateQuantity(currentQty - 1);
    });
  }
  
  if (increaseBtn) {
    increaseBtn.addEventListener('click', function() {
      const currentQty = parseInt(document.getElementById('quantity').value) || 1;
      updateQuantity(currentQty + 1);
    });
  }
  
  // Form handlers
  const wilayaSelect = document.getElementById('wilaya');
  const deliveryTypeSelect = document.getElementById('delivery_type');
  
  if (wilayaSelect) {
    wilayaSelect.addEventListener('change', function(e) {
      populateCommunes(e.target.value);
      updatePriceDisplay();
    });
  }
  
  if (deliveryTypeSelect) {
    deliveryTypeSelect.addEventListener('change', updatePriceDisplay);
  }
  
  // Scroll monitoring
  const debouncedScrollHandler = debounce(() => {
    toggleFloatingCTA();
  }, 16);

  window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
  window.addEventListener('resize', toggleFloatingCTA);
  
  // Phone validation
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      const lang = getLang();
      const text = i18n[lang];
      const phoneStatus = document.getElementById('phoneStatus');
      
      this.value = this.value.replace(/[^0-9]/g, '');
      const phone = this.value;
      
      if (phone.length === 0) {
        phoneInput.classList.remove('valid', 'invalid');
        if (phoneStatus) phoneStatus.style.display = 'none';
        return;
      }
      
      if (phone.length < 10) {
        phoneInput.classList.remove('valid');
        phoneInput.classList.add('invalid');
        if (phoneStatus) {
          phoneStatus.textContent = text.phoneHintShort;
          phoneStatus.className = 'phone-status error';
          phoneStatus.style.display = 'block';
        }
        return;
      }
      
      if (!validatePhoneAdvanced(phone)) {
        phoneInput.classList.remove('valid');
        phoneInput.classList.add('invalid');
        if (phoneStatus) {
          phoneStatus.textContent = text.phoneHintPrefix;
          phoneStatus.className = 'phone-status error';
          phoneStatus.style.display = 'block';
        }
      } else {
        phoneInput.classList.remove('invalid');
        phoneInput.classList.add('valid');
        if (phoneStatus) {
          phoneStatus.textContent = text.phoneHintOk;
          phoneStatus.className = 'phone-status success';
          phoneStatus.style.display = 'block';
        }
      }
    });
  }
  
  // Order form submission
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmissionSecure);
  }
  
  // Keyboard support for modal
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (modal && modal.style.display === 'block') {
      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          modalPrev();
          break;
        case 'ArrowRight':
          modalNext();
          break;
      }
    }
  });
  
  // Initial setup
  updateQuantity(1);
  switchLanguage(getLang());
  updateHeaderPrice();
  updatePriceDisplay();
  updateFloatingCTA();
  toggleFloatingCTA();
  trackViewContent();
  
  console.log('✅ Dermevia Secure App Loaded Successfully with Netlify Functions');
  console.log('🔒 Security Fingerprint:', securityFingerprint);
  console.log('🌐 Client IP:', clientIP);
  console.log('📡 API Endpoints:', CONFIG.NETLIFY_FUNCTIONS_BASE);
  console.log('⚡ Rate limiting: Server-side + local fallback');
});

// Service Worker - Disabled temporarily
/*
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => console.log('✅ Service Worker registered'))
      .catch(error => console.log('❌ Service Worker registration failed:', error));
  });
} else {
  console.log('📁 Running locally or no HTTPS - Service Worker disabled');
}
*/

// =========== UTILITY FUNCTIONS ===========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =========== ERROR HANDLING ===========
window.addEventListener('error', (e) => {
  console.warn('Script error:', e.error?.message || 'Unknown error');
  
  // Report critical errors
  if (CONFIG.DEBUG_MODE) {
    console.error('Full error details:', e);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.warn('Unhandled promise rejection:', e.reason);
  e.preventDefault();
  
  if (CONFIG.DEBUG_MODE) {
    console.error('Promise rejection details:', e);
  }
});

// =========== GLOBAL FUNCTIONS FOR HTML EVENTS ===========
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.openModal = openModal;
window.closeModal = closeModal;
window.modalPrev = modalPrev;
window.modalNext = modalNext;

console.log('🔧 Dermevia App - Netlify Functions Enhanced Version 3.0');
console.log('✨ Features: Server-side security, rate limiting, enhanced error handling');