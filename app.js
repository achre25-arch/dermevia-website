'use strict';

// =========== ENHANCED SECURITY CONFIGURATION ===========
const CONFIG = {
  NETLIFY_FUNCTIONS_BASE: '/.netlify/functions',
  SUBMIT_ENDPOINT: '/.netlify/functions/submit-form',
  RATE_LIMIT_ENDPOINT: '/.netlify/functions/validate-rate-limit',
  PHONE_COOLDOWN_MS: 24 * 60 * 60 * 1000, // 24h
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
    acneText: "🎯 الحل الطبي الأمثل لمحاربة حب الشباب",
    acneSubtext: "تركيبة 1% كبريت مُعتمدة طبياً + خلاصات طبيعية لبشرة صافية ونظيفة",
    ctaButton: "احصلي على Dermevia Pureskin الآن",
    problemTitle: "هل تواجهين مشاكل البشرة هذه؟",
    benefitsTitle: "لماذا Dermevia Pureskin هو الاختيار الأفضل؟",
    benefitsSubtitle: "منتج طبي مُختبر سريرياً يجمع بين قوة الكبريت الطبيعي وفعالية المكونات النشطة",
    guaranteeTitle: "ضمان استرداد الأموال لمدة 15 يوم",
    guaranteeText: "ثقتنا في فعالية Dermevia Pureskin تامة! إذا لم تشعري بالفرق خلال 15 يوماً، احصلي على استرداد 50% من قيمة المنتج فوراً.",
    testimonialsTitle: "ماذا تقول عملاؤنا؟",
    testimonialsSubtitle: "تعليقات حقيقية من منصات التواصل الاجتماعي",
    finalPriceTitle: "عرض خاص - محدود المدة",
    finalPriceNote: "ضمان 15 يوم + توصيل لجميع الولايات",
    orderTitle: "إتمام الطلب",
    quantityHeaderLabel: "الكمية:",
    nameLabel: "👤 الاسم الأول * (اللقب اختياري)",
    phoneLabel: "📱 رقم الهاتف *",
    wilayaLabel: "📍 الولاية *",
    communeLabel: "🏘️ البلدية *",
    deliveryTypeLabel: "🚚 نوع التوصيل *",
    selectWilaya: "اختر الولاية",
    selectCommune: "اختر البلدية",
    selectDelivery: "اختر نوع التوصيل",
    homeText: "🏠 توصيل للمنزل",
    officeText: "🏢 توصيل للمكتب",
    confirm: "تأكيد الطلب مع ضمان 15 يوم",
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
    rateLimitText: "يمكنك تقديم طلبين كحد أقصى خلال 24 ساعة. يرجى المحاولة بعد:",
    currency: "دج",
    pieces: "قطعة",
    // Header/billing labels
    productPillText: "المنتج: Dermevia Pureskin - منظف الوجه بالكبريت",
    unitPriceLabel: "سعر القطعة",
    discountBadgeText: "خصم 30%",
    productPriceLabel: "سعر المنتج",
    deliveryCostLabel: "تكلفة التوصيل",
    invoiceTotalLabel: "إجمالي الفاتورة",
    afterDiscountLabel: "بعد الخصم",
    // Footer (كما في ملفك)
    footerTagline: "علم العناية بالبشرة الأوروبي المتقدم",
    footerContactTitle: "📞 مصلحة الزبائن",
    footerContactPhone: "+213 770 45 32 10 / +213 555 123 456",
    footerContactHours: "🕐 السبت - الخميس: 9 صباحا - 6 مساءا",
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
    footerPaymentText: "عند الاستلام و بعد فحص طردكم",
    footerAboutTitle: "🔬 نبذة عن Dermevia Labs",
    footerAboutText: "مختبر أوروبي رائد تأسس في سويسرا عام 2003...",
    footerAchievements: "إنجازاتنا: +2 مليون عميل عالمياً | 20+ سنة خبرة أوروبية | معدل رضا 98%",
    footerCopyright: "© 2024 Dermevia Labs Switzerland - موزع حصرياً في الجزائر عبر Dermevia Algérie EURL",
    footerDesign: "Distribué en Algérie par Dermevia Algérie EURL - Lot 102, Zone Industrielle Oued Smar, Alger",
    galleryTitle: "تفاصيل المنتج"
  },
  fr: { 
    productBadge: "✨ Innovation Dermevia Labs",
    heroTitle: "Dermevia Pureskin",
    heroSubtitle: "Nettoyant facial révolutionnaire au soufre", 
    heroDescription: "Formule scientifique avancée...",
    ctaButton: "Commandez Dermevia Pureskin maintenant",
    problemTitle: "Vous souffrez de ces problèmes cutanés ?",
    benefitsTitle: "Pourquoi choisir Dermevia Pureskin ?",
    benefitsSubtitle: "Dispositif médical testé cliniquement...",
    guaranteeTitle: "Garantie remboursement 15 jours",
    guaranteeText: "Résultats visibles sous 15 jours...",
    testimonialsTitle: "Que disent nos clients ?",
    testimonialsSubtitle: "Avis authentiques des réseaux sociaux",
    finalPriceTitle: "Offre spéciale - Quantités limitées",
    finalPriceNote: "Garantie 15 jours + livraison gratuite",
    orderTitle: "Complétez votre commande sécurisée",
    quantityHeaderLabel: "Quantité:",
    nameLabel: "👤 Prénom * (nom de famille optionnel)",
    phoneLabel: "📱 Numéro de téléphone *",
    wilayaLabel: "📍 Wilaya *",
    communeLabel: "🏘️ Commune *",
    deliveryTypeLabel: "🚚 Mode de livraison *",
    selectWilaya: "Choisissez la wilaya",
    selectCommune: "Choisissez la commune",
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
    rateLimitText: "Maximum 2 commandes par 24h. Réessayez dans:",
    currency: "DA",
    pieces: "unités",
    // Header/billing labels
    productPillText: "Produit : Dermevia Pureskin - nettoyant au soufre",
    unitPriceLabel: "Prix unitaire",
    discountBadgeText: "Remise 30%",
    productPriceLabel: "Prix du produit",
    deliveryCostLabel: "Frais de livraison",
    invoiceTotalLabel: "Total de la facture",
    afterDiscountLabel: "Après remise",
    // Footer (كما في ملفك)
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
    footerGuaranteeText: "15 jours de garantie complète",
    footerReturnLabel: "🔄 Politique de Retour:",
    footerReturnText: "Retour possible sous 15 jours...",
    footerShippingLabel: "🚚 Livraison:",
    footerShippingText: "Livraison toutes wilayas",
    footerPaymentLabel: "💳 Paiement:",
    footerPaymentText: "À la livraison",
    footerAboutTitle: "🔬 À propos de Dermevia Labs",
    footerAboutText: "Laboratoire européen leader...",
    footerAchievements: "Nos réalisations...",
    footerCopyright: "© 2024 Dermevia Labs Switzerland...",
    footerDesign: "Distribué en Algérie par Dermevia Algérie EURL",
    galleryTitle: "Détails du produit"
  }
};

// =========== TESTIMONIALS DATA ===========
const TESTIMONIALS = {
  ar: [
    {
      platform: "📘",
      name: "أمينة بن علي",
      location: "الجزائر العاصمة",
      rating: 5,
      text: "والله المنتج هايل! من أول أسبوع لاحظت نقص واضح في اللمعان والحبوب بدات تجف. ريحته خفيفة وما ينشفش البشرة.",
      time: "منذ 3 أيام",
      avatars: [
        "https://i.pravatar.cc/120?u=amina.benali.algiers",
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Amina%20Benali&backgroundColor=b6e3f4&radius=50"
      ]
    },
    {
      platform: "📷",
      name: "سارة عليوي",
      location: "وهران",
      rating: 5,
      text: "استعملتو صباح ومساء، نتيجته واضحة خاصة على الرؤوس السوداء. التوصيل كان سريع وخدمة العملاء محترمة.",
      time: "منذ أسبوع",
      avatars: [
        "https://i.pravatar.cc/120?u=sarah.aloui.oran",
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Sarah%20Aloui&backgroundColor=c0aede&radius=50"
      ]
    },
    {
      platform: "📘",
      name: "نور الهدى كمال",
      location: "قسنطينة",
      rating: 5,
      text: "حسيت بالفرق في نعومة البشرة خلال أيام. ينظف بعمق بدون ما يسبب جفاف. أنصح به للبشرة الدهنية.",
      time: "منذ 5 أيام",
      avatars: [
        "https://i.pravatar.cc/120?u=nourelhoda.kamal.constantine",
        "https://randomuser.me/api/portraits/women/65.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Nour%20Elhoda%20Kamal&backgroundColor=ffd5dc&radius=50"
      ]
    }
  ],
  fr: [
    {
      platform: "📘",
      name: "Leila Boudjemaa",
      location: "Alger",
      rating: 5,
      text: "Produit excellent ! Ma peau est moins grasse et les boutons sèchent rapidement. Odeur légère et agréable.",
      time: "Il y a 2 jours",
      avatars: [
        "https://i.pravatar.cc/120?u=leila.boudjemaa.alger",
        "https://randomuser.me/api/portraits/women/12.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Leila%20Boudjemaa&backgroundColor=b6e3f4&radius=50"
      ]
    },
    {
      platform: "📷",
      name: "Fatima Rezki",
      location: "Oran",
      rating: 5,
      text: "Enfin un nettoyant efficace pour peau grasse. Les points noirs ont diminué et ma peau est plus lisse.",
      time: "Il y a 1 semaine",
      avatars: [
        "https://i.pravatar.cc/120?u=fatima.rezki.oran",
        "https://randomuser.me/api/portraits/women/22.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Fatima%20Rezki&backgroundColor=c0aede&radius=50"
      ]
    },
    {
      platform: "📘",
      name: "Khadija Mansouri",
      location: "Constantine",
      rating: 5,
      text: "Très satisfaite. Nettoie en profondeur sans assécher. Je recommande pour les peaux mixtes à grasses.",
      time: "Il y a 4 jours",
      avatars: [
        "https://i.pravatar.cc/120?u=khadija.mansouri.constantine",
        "https://randomuser.me/api/portraits/women/47.jpg",
        "https://api.dicebear.com/7.x/adventurer/png?seed=Khadija%20Mansouri&backgroundColor=ffd5dc&radius=50"
      ]
    }
  ]
};

// =========== GLOBAL STATE ===========
let clientIP = null;
let securityFingerprint = null;
let rateCountdownInterval = null;

// =========== SLIDESHOW / MODAL VARS ===========
let currentSlideIndex = 0;
let slideInterval;
let currentModalImages = [];
let currentModalIndex = 0;

// =========== SECURITY HELPERS ===========
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
  } catch {
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
  } catch { return 'webgl-error'; }
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
  } catch { return 'font-error'; }
}
function sanitizeInputAdvanced(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'&\x00-\x1f\x7f-\x9f]/g, '').replace(/\s+/g, ' ').trim().substring(0, 500);
}
function validatePhoneAdvanced(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 && /^(05|06|07)/.test(cleanPhone) && ![/^(.)\1{9}$/, /^0123456789$/, /^0987654321$/].some(p => p.test(cleanPhone));
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

// =========== IP FETCH ===========
async function fetchIPSecure() {
  try {
    const isLocal = ['localhost','127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
    if (isLocal) { clientIP = 'local_' + Date.now().toString(36); return; }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal, mode: 'cors', headers: { 'Accept': 'application/json' } });
      clearTimeout(timeoutId);
      if (response.ok) { const data = await response.json(); clientIP = data.ip; }
      else throw new Error('IP fetch failed');
    } catch {
      clearTimeout(timeoutId);
      try {
        const controller2 = new AbortController();
        const t2 = setTimeout(() => controller2.abort(), 5000);
        const res2 = await fetch('https://ipapi.co/json/', { signal: controller2.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(t2);
        if (res2.ok) { const j = await res2.json(); clientIP = j.ip; }
        else throw new Error('Fallback failed');
      } catch { clientIP = 'unknown_' + Date.now().toString(36); }
    }
  } catch { clientIP = 'error_' + Date.now().toString(36); }
}

// =========== LOCAL RATE LIMIT FALLBACK ===========
function canOrderByPhoneLocal(phone) {
  try {
    const sanitizedPhone = sanitizeInputAdvanced(phone);
    if (!validatePhoneAdvanced(sanitizedPhone)) return { ok: false, left: 0, reason: 'invalid_phone' };
    const phoneKey = 'dermevia_phone_' + btoa(sanitizedPhone + CONFIG.SECURITY_SALT).substring(0, 16);
    const json = localStorage.getItem(phoneKey);
    if (!json) return { ok: true, left: 0 };
    let arr; try { arr = JSON.parse(json); } catch { arr = []; }
    const now = Date.now();
    const valid = arr.filter(ts => (now - ts) < CONFIG.PHONE_COOLDOWN_MS);
    if (valid.length !== arr.length) localStorage.setItem(phoneKey, JSON.stringify(valid));
    if (valid.length >= CONFIG.MAX_ORDERS_PER_PHONE) {
      const oldest = Math.min(...valid);
      const left = CONFIG.PHONE_COOLDOWN_MS - (now - oldest);
      return { ok: false, left, count: valid.length };
    }
    return { ok: true, left: 0, count: valid.length };
  } catch { return { ok: true, left: 0 }; }
}
function saveOrderAdvanced(phone) { 
  try {
    const sanitizedPhone = sanitizeInputAdvanced(phone);
    const phoneKey = 'dermevia_phone_' + btoa(sanitizedPhone + CONFIG.SECURITY_SALT).substring(0, 16);
    const now = Date.now();
    let arr = []; const json = localStorage.getItem(phoneKey);
    if (json) { try { arr = JSON.parse(json); if (!Array.isArray(arr)) arr = []; } catch { arr = []; } }
    arr.push(now);
    arr = arr.filter(ts => (now - ts) < CONFIG.PHONE_COOLDOWN_MS);
    localStorage.setItem(phoneKey, JSON.stringify(arr));
  } catch {}
}

// =========== UTILS ===========
function getLang() { return localStorage.getItem('dermevia_lang') || 'ar'; }
function setLang(lang) { localStorage.setItem('dermevia_lang', lang); }
function formatCurrency(value) { return value + ' ' + i18n[getLang()].currency; }
function formatTimeLeft(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2,'0'); s%=3600;
  const m = String(Math.floor(s / 60)).padStart(2,'0'); s%=60;
  return `${h}:${m}:${String(s).padStart(2,'0')}`;
}
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// =========== ORDER SENDER ===========
async function sendOrderSecure(data) {
  const maxRetries = CONFIG.MAX_RETRY_ATTEMPTS;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
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

      const text = await response.text();
      let json = {};
      try { json = JSON.parse(text); } catch { json = {}; }

      if (response.status === 200 && json.success) return { success: true, data: json };

      if (response.status === 429) {
        const ttlMs = Number(json?.limit_info?.next_available_in_ms ?? json?.nextAvailableInMs ?? CONFIG.PHONE_COOLDOWN_MS);
        return { success:false, error:'rate_limit', ttlMs, message: json?.message, data: json };
      }

      if (response.status === 400) return { success:false, error:'validation', message: json?.error || 'Invalid data' };

      if (attempt === maxRetries) return { success:false, error:'server', message: json?.error || 'Server error' };
      await new Promise(r=>setTimeout(r,1000*attempt));
    } catch (err) {
      if (err.name === 'AbortError') { if (attempt === maxRetries) return { success:false, error:'timeout', message:'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' }; }
      else if ((err.message||'').includes('NetworkError') || (err.message||'').includes('Failed to fetch')) { if (attempt === maxRetries) return { success:false, error:'network', message:i18n[getLang()].networkError }; }
      else { if (attempt === maxRetries) return { success:false, error:'server', message:i18n[getLang()].serverError }; }
      if (attempt < maxRetries) await new Promise(r=>setTimeout(r,1000*attempt));
    }
  }
  return { success:false, error:'max_retries', message:'فشل في الإرسال بعد عدة محاولات' };
}

// =========== UI HELPERS ===========
function showError(message) {
  const errorBox = document.getElementById('errorBox');
  const successBox = document.getElementById('successBox');
  const alreadyBox = document.getElementById('alreadyBox');
  const rateLimitBox = document.getElementById('rateLimitBox');
  if (errorBox) { errorBox.textContent = message; errorBox.style.display = 'block'; }
  if (successBox) successBox.style.display = 'none';
  if (alreadyBox) alreadyBox.style.display = 'none';
  if (rateLimitBox) rateLimitBox.style.display = 'none';
  setTimeout(() => { errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}
function showSuccess(message) {
  const errorBox = document.getElementById('errorBox');
  const successBox = document.getElementById('successBox');
  const alreadyBox = document.getElementById('alreadyBox');
  const rateLimitBox = document.getElementById('rateLimitBox');
  if (successBox) { successBox.textContent = message; successBox.style.display = 'block'; }
  if (errorBox) errorBox.style.display = 'none';
  if (alreadyBox) alreadyBox.style.display = 'none';
  if (rateLimitBox) rateLimitBox.style.display = 'none';
  setTimeout(() => { successBox?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}
function hideMessages() {
  ['errorBox','successBox','alreadyBox','rateLimitBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
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
  if (interval) clearInterval(parseInt(interval));
  button.disabled = false;
  button.classList.remove('loading');
  const lang = getLang();
  button.textContent = button.dataset.originalText || (lang === 'ar' ? 'تأكيد الطلب الآمن مع الضمان' : 'Confirmer la commande sécurisée avec garantie');
  button.style.background = 'linear-gradient(135deg, #009fe3, #0086c7)';
}

// =========== RATE LIMIT MESSAGE + COUNTDOWN ===========
function showServerRateLimitCountdown(ttlMs) {
  const lang = getLang();
  const baseText = i18n[lang].rateLimitText;
  const waitMs = Math.max(0, Number(ttlMs || CONFIG.PHONE_COOLDOWN_MS));
  const end = Date.now() + waitMs;

  let box = document.getElementById('rate-limit');
  let msgEl = document.getElementById('rate-msg');
  let timerEl = document.getElementById('rate-timer');

  if (!box) {
    box = document.createElement('div');
    box.id = 'rate-limit';
    box.style.cssText = 'margin:16px 0;padding:12px;background:#fff3cd;border:1px solid #ffeeba;color:#664d03;border-radius:8px;font-weight:700;text-align:center';
    msgEl = document.createElement('span'); msgEl.id = 'rate-msg';
    const space = document.createTextNode(' ');
    timerEl = document.createElement('strong'); timerEl.id = 'rate-timer'; timerEl.style.marginInlineStart = '8px';

    box.appendChild(msgEl); box.appendChild(space); box.appendChild(timerEl);

    const orderCard = document.getElementById('orderCard');
    const form = document.getElementById('orderForm');
    if (form && form.parentNode) form.parentNode.insertBefore(box, form);
    else if (orderCard) orderCard.prepend(box);
    else document.body.prepend(box);
  }

  if (msgEl) msgEl.textContent = baseText;

  if (window.__rateCountdownInterval) clearInterval(window.__rateCountdownInterval);

  const update = () => {
    const left = Math.max(0, end - Date.now());
    if (timerEl) timerEl.textContent = formatTimeLeft(left);
    if (left <= 0) {
      clearInterval(window.__rateCountdownInterval);
      if (box) box.style.display = 'none';
    } else {
      box.style.display = 'block';
    }
  };
  update();
  window.__rateCountdownInterval = setInterval(update, 1000);
  box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function updateRateLimitBannerLanguage(){
  const msg = document.getElementById('rate-msg');
  if (msg) msg.textContent = i18n[getLang()].rateLimitText;
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
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!validateNameAdvanced(name)) { showError(text.errName + ' (يمكن أن يكون الاسم الأول فقط)'); document.getElementById('name').focus(); return false; }
  if (!validatePhoneAdvanced(phone)) { showError(text.errPhone + ' (يجب أن يكون رقماً جزائرياً صحيحاً)'); document.getElementById('phone').focus(); return false; }
  if (!quantity || quantity < 1 || quantity > 10) { showError('يرجى اختيار كمية صحيحة (1-10)'); return false; }
  if (!wilaya) { showError(text.errWilaya); document.getElementById('wilaya').focus(); return false; }
  if (!commune) { showError(text.errCommune); document.getElementById('commune').focus(); return false; }
  if (!deliveryType || !['home','office'].includes(deliveryType)) { showError(text.errDelivery); document.getElementById('delivery_type').focus(); return false; }
  return true;
}

// =========== PRICING HELPERS ===========
function calculateDiscountedPrice(originalPrice, quantity) {
  return quantity >= 2 ? Math.floor(originalPrice * 0.7) : originalPrice;
}
function saveOrderLocally(order) {
  try {
    const orders = JSON.parse(localStorage.getItem('dermevia_orders') || '[]');
    orders.unshift(order); if (orders.length > 10) orders.splice(10);
    localStorage.setItem('dermevia_orders', JSON.stringify(orders));
    localStorage.setItem('dermevia_last_order', JSON.stringify(order));
  } catch {}
}

// =========== TESTIMONIALS RENDER ===========
function renderTestimonials(lang) {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  const data = TESTIMONIALS[lang] || [];
  const makeStars = n => '⭐'.repeat(Math.max(0, Math.min(5, Math.round(n || 5))));

  grid.innerHTML = data.map((t, idx) => {
    const srcset = encodeURIComponent(JSON.stringify(t.avatars || []));
    const first = (t.avatars && t.avatars[0]) || '';
    return `
      <div class="testimonial-card">
        <div class="social-platform">${t.platform || ''}</div>
        <div class="testimonial-header">
          <img
            src="${first}"
            class="testimonial-avatar-img"
            alt="${t.name}"
            referrerpolicy="no-referrer"
            data-srcset="${srcset}"
            data-idx="0"
            onerror="window.__avatarFallback && window.__avatarFallback(this)"
          >
          <div class="testimonial-user-info">
            <h4>${t.name}</h4>
            <div class="testimonial-location">${t.location || ''}</div>
          </div>
        </div>
        <div class="testimonial-rating">${makeStars(t.rating)}</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-time">${t.time || ''}</div>
      </div>
    `;
  }).join('');
}

// =========== ORDER HANDLER ===========
async function handleOrderSubmissionSecure(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  if (!submitBtn || submitBtn.disabled) return;

  try {
    const phone = document.getElementById('phone').value.trim();
    if (!validateFormAdvanced()) return;

    hideMessages();
    showLoadingState(submitBtn);

    const localCheck = canOrderByPhoneLocal(phone);
    if (!localCheck.ok) {
      resetButtonState(submitBtn);
      showServerRateLimitCountdown(localCheck.left);
      return;
    }

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
      quantity,
      subtotal_price: subtotalPrice,
      discount_amount: discountAmount,
      discount_percentage: quantity >= 2 ? 30 : 0,
      name: document.getElementById('name').value.trim(),
      phone,
      wilaya: wilayaOption.text,
      commune: document.getElementById('commune').value,
      delivery_type: deliveryType,
      delivery_price: deliveryPrice,
      total_price: totalPrice,
      lang,
      client_ip: clientIP || 'unknown',
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

    const result = await sendOrderSecure(order);

    if (result.success) {
      saveOrderAdvanced(phone);
      saveOrderLocally(order);
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
      } catch {}

      window.location.href = '/order.html';
      return;
    }

    resetButtonState(submitBtn);

    if (result.error === 'rate_limit') {
      showServerRateLimitCountdown(result.ttlMs);
      return;
    }
    if (result.error === 'validation') { showError('بيانات غير صحيحة. يرجى التحقق من المعلومات.'); return; }
    if (result.error === 'timeout') { showError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.'); return; }
    if (result.error === 'network') { showError(i18n[lang].networkError); return; }
    showError(i18n[lang].serverError);

  } catch (error) {
    resetButtonState(submitBtn);
    showError(i18n[getLang()].errorMessage);
  }
}

// =========== باقي الوظائف المرئية (سلايد شو، صور، أسعار) ===========
function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  startAutoSlide();
  const container = document.querySelector('.slideshow-container');
  if (container) {
    container.addEventListener('mouseenter', stopAutoSlide);
    container.addEventListener('mouseleave', startAutoSlide);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') changeSlide(-1); else if (e.key === 'ArrowRight') changeSlide(1); });
}
function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length === 0) return;
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (slides[index]) slides[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
  currentSlideIndex = index;
}
function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  let idx = currentSlideIndex + direction;
  if (idx >= slides.length) idx = 0;
  else if (idx < 0) idx = slides.length - 1;
  showSlide(idx);
  if (slideInterval) { clearInterval(slideInterval); startAutoSlide(); }
}
function currentSlide(index) { showSlide(index - 1); if (slideInterval) { clearInterval(slideInterval); startAutoSlide(); } }
function startAutoSlide() { if (slideInterval) clearInterval(slideInterval); slideInterval = setInterval(() => changeSlide(1), 4000); }
function stopAutoSlide() { if (slideInterval) { clearInterval(slideInterval); slideInterval = null; } }

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
  if (modal && modalImage) { modalImage.src = imageSrc; modal.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}
function closeModal() { const modal = document.getElementById('imageModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; } }
function modalPrev() { currentModalIndex = currentModalIndex > 0 ? currentModalIndex - 1 : currentModalImages.length - 1; const modalImage = document.getElementById('modalImage'); if (modalImage) modalImage.src = currentModalImages[currentModalIndex]; }
function modalNext() { currentModalIndex = currentModalIndex < currentModalImages.length - 1 ? currentModalIndex + 1 : 0; const modalImage = document.getElementById('modalImage'); if (modalImage) modalImage.src = currentModalImages[currentModalIndex]; }

function handleImageError(img) {
  const fallbackDiv = document.createElement('div');
  fallbackDiv.className = 'image-fallback';
  fallbackDiv.style.cssText = `width:${img.offsetWidth||200}px;height:${img.offsetHeight||150}px;background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%);border:2px dashed #dee2e6;display:flex;align-items:center;justify-content:center;color:#6c757d;font-size:14px;font-weight:600;border-radius:${window.getComputedStyle(img).borderRadius||'8px'};`;
  fallbackDiv.textContent = '📷 ' + (img.alt || 'صورة المنتج');
  if (img.parentNode) img.parentNode.replaceChild(fallbackDiv, img);
}
function initImageFallbacks() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
    if (!img.complete && img.src) img.addEventListener('load', () => {});
  });
}
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window && images.length > 0) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => { if (entry.isIntersecting) { const img = entry.target; img.src = img.dataset.src; img.removeAttribute('data-src'); observer.unobserve(img); } });
    });
    images.forEach(img => obs.observe(img));
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
  const t = i18n[getLang()];
  const originalPrice = parseInt(document.getElementById('productPrice').value) || 0;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const priceOnlyPill = document.getElementById('priceOnlyPill');
  if (!priceOnlyPill) return;

  if (quantity >= 2) {
    const discountedPrice = calculateDiscountedPrice(originalPrice, quantity);
    const totalAfterDiscount = discountedPrice * quantity;
    priceOnlyPill.innerHTML =
      `${t.unitPriceLabel}: <strike>${formatCurrency(originalPrice)}</strike> ${formatCurrency(discountedPrice)} × ${quantity} = ${formatCurrency(totalAfterDiscount)} ` +
      `<span class="discount-badge">${t.discountBadgeText}</span>`;
  } else if (quantity > 1) {
    const subtotal = originalPrice * quantity;
    priceOnlyPill.textContent = `${t.unitPriceLabel}: ${formatCurrency(originalPrice)} × ${quantity} = ${formatCurrency(subtotal)}`;
  } else {
    priceOnlyPill.textContent = `${t.unitPriceLabel}: ${formatCurrency(originalPrice)}`;
  }
}
function updatePriceDisplay() {
  const t = i18n[getLang()];
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
    let html = '';
    if (quantity >= 2) {
      const originalSubtotal = originalPrice * quantity;
      html = `${t.productPriceLabel}: ${formatCurrency(originalPrice)} × ${quantity} = <strike>${formatCurrency(originalSubtotal)}</strike> | ${t.afterDiscountLabel}: ${formatCurrency(subtotalPrice)} (${t.discountBadgeText}) | ${t.deliveryCostLabel}: ${formatCurrency(deliveryPrice)} | <span style="color:#009fe3; font-size: 1.2em;">${t.invoiceTotalLabel}: ${formatCurrency(totalPrice)}</span>`;
    } else {
      html = `${t.productPriceLabel}: ${formatCurrency(originalPrice)} × ${quantity} = ${formatCurrency(subtotalPrice)} | ${t.deliveryCostLabel}: ${formatCurrency(deliveryPrice)} | <span style="color:#009fe3; font-size: 1.2em;">${t.invoiceTotalLabel}: ${formatCurrency(totalPrice)}</span>`;
    }
    priceDisplay.innerHTML = html;
    priceDisplay.style.display = 'block';
  } else { priceDisplay.style.display = 'none'; }
}
function updateFinalPriceAmount() {
  const el = document.getElementById('finalPriceAmount');
  const price = parseInt(document.getElementById('productPrice')?.value || '0') || 0;
  if (el) el.textContent = formatCurrency(price);
}
function updateFloatingCTA() {
  const lang = getLang();
  const el = document.getElementById('floatingCTAText');
  if (!el) return;
  el.textContent = lang === 'ar' ? "اطلبي Dermevia Pureskin بأمان" : "Commandez Dermevia Pureskin en sécurité";
}
function toggleFloatingCTA() {
  const floatingCTA = document.getElementById('floatingCTA');
  const orderCard = document.getElementById('orderCard');
  if (!floatingCTA || !orderCard) return;
  const rect = orderCard.getBoundingClientRect();
  const visible = rect.top < window.innerHeight && rect.bottom > 0;
  if (visible || orderCard.style.display === 'block') floatingCTA.classList.add('hidden');
  else floatingCTA.classList.remove('hidden');
}

function showOrderForm() {
  const orderCard = document.getElementById('orderCard');
  if (orderCard) { orderCard.style.display = 'block'; orderCard.scrollIntoView({ behavior: 'smooth' }); }
  window.formStartTime = Date.now();
  setTimeout(() => { toggleFloatingCTA(); }, 100);
  try { if (typeof fbq === 'function') { fbq('track', 'InitiateCheckout', { value: parseInt(document.getElementById('productPrice').value) / 100, currency: 'USD', content_name: document.getElementById('productId').value }); } } catch {}
}

// =========== LANGUAGE ===========
function translateByDataAttrs(lang) {
  document.querySelectorAll('[data-ar],[data-fr]').forEach(el => {
    const val = (lang === 'ar') ? el.getAttribute('data-ar') : el.getAttribute('data-fr');
    if (val != null) el.textContent = val;
  });
}
function switchLanguage(lang) {
  setLang(lang);
  const html = document.documentElement;
  const body = document.getElementById('body');
  html.lang = lang; html.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  if (body) body.className = (lang === 'ar') ? 'rtl' : 'ltr';

  const arBtn = document.getElementById('ar-btn');
  const frBtn = document.getElementById('fr-btn');
  if (arBtn) arBtn.classList.toggle('active', lang === 'ar');
  if (frBtn) frBtn.classList.toggle('active', lang === 'fr');

  const text = i18n[lang];
  const elementsToUpdate = {
    'productBadge': text.productBadge,'heroTitle': text.heroTitle,'heroSubtitle': text.heroSubtitle,'heroDescription': text.heroDescription,
    'acneText': text.acneText,'acneSubtext': text.acneSubtext,'ctaButton': text.ctaButton,'problemTitle': text.problemTitle,
    'benefitsTitle': text.benefitsTitle,'benefitsSubtitle': text.benefitsSubtitle,'guaranteeTitle': text.guaranteeTitle,'guaranteeText': text.guaranteeText,
    'testimonialsTitle': text.testimonialsTitle,'testimonialsSubtitle': text.testimonialsSubtitle,'finalPriceTitle': text.finalPriceTitle,'finalPriceNote': text.finalPriceNote,
    'orderTitle': text.orderTitle,'quantityHeaderLabel': text.quantityHeaderLabel,'nameLabel': text.nameLabel,'phoneLabel': text.phoneLabel,
    'wilayaLabel': text.wilayaLabel,'communeLabel': text.communeLabel,'deliveryTypeLabel': text.deliveryTypeLabel,'galleryTitle': text.galleryTitle
  };
  Object.entries(elementsToUpdate).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) { if (el.tagName === 'LABEL') el.innerHTML = val; else el.textContent = val; } });

  const selectElements = { 'selectWilaya': text.selectWilaya, 'selectCommune': text.selectCommune, 'selectDelivery': text.selectDelivery, 'homeText': text.homeText, 'officeText': text.officeText, 'submitBtn': text.confirm };
  Object.entries(selectElements).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) el.textContent = val; });

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  if (nameInput) nameInput.placeholder = lang === 'ar' ? 'الاسم الأول (واللقب اختياري)' : 'Prénom (nom optionnel)';
  if (phoneInput) phoneInput.placeholder = '0555123456';

  const productPill = document.getElementById('productPill');
  if (productPill) productPill.textContent = text.productPillText;

  const footerElements = {
    'footerTagline': text.footerTagline,'footerContactTitle': text.footerContactTitle,'footerContactPhone': text.footerContactPhone,'footerContactHours': text.footerContactHours,'footerContactEmail': text.footerContactEmail,
    'footerAddressTitle': text.footerAddressTitle,'footerAddress1': text.footerAddress1,'footerAddress2': text.footerAddress2,'footerPoliciesTitle': text.footerPoliciesTitle,
    'footerGuaranteeLabel': text.footerGuaranteeLabel,'footerGuaranteeText': text.footerGuaranteeText,'footerReturnLabel': text.footerReturnLabel,'footerReturnText': text.footerReturnText,
    'footerShippingLabel': text.footerShippingLabel,'footerShippingText': text.footerShippingText,'footerPaymentLabel': text.footerPaymentLabel,'footerPaymentText': text.footerPaymentText,
    'footerAboutTitle': text.footerAboutTitle,'footerAboutText': text.footerAboutText,'footerAchievements': text.footerAchievements,'footerCopyright': text.footerCopyright,'footerDesign': text.footerDesign
  };
  Object.entries(footerElements).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) el.textContent = val; });

  // تحديث كل عناصر data-*
  translateByDataAttrs(lang);

  // إعادة توليد التقييمات بالكامل حسب اللغة
  renderTestimonials(lang);

  // تحديث بقية الأجزاء
  updateSlideshowForLanguage(lang);
  updateHeaderPrice();
  updatePriceDisplay();
  updateFinalPriceAmount();
  updateRateLimitBannerLanguage();
  updateFloatingCTA();
}
function updateSlideshowForLanguage(lang) {
  const captions = document.querySelectorAll('.slide-caption');
  const ar = ['منظف الوجه بالكبريت الطبيعي','مكونات طبيعية 100%','نتائج مضمونة خلال أسبوعين','سهل الاستخدام - مرتين يومياً'];
  const fr = ['Nettoyant facial au soufre naturel','Ingrédients 100% naturels','Résultats garantis en deux semaines','Facile à utiliser - deux fois par jour'];
  captions.forEach((c, i) => { c.textContent = (lang === 'ar' ? ar[i] : fr[i]) || ''; });
}

// =========== TRACKING ===========
function trackViewContent() {
  try { if (typeof fbq === 'function') { const productId = document.getElementById('productId'); const productPrice = document.getElementById('productPrice'); if (productId && productPrice) fbq('track','ViewContent',{ content_name: productId.value, content_type:'product', value: parseInt(productPrice.value)/100, currency:'USD' }); } } catch {}
}

// =========== MAIN INIT ===========
document.addEventListener('DOMContentLoaded', async function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => { if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) e.preventDefault(); });

  generateSecurityFingerprint();
  await fetchIPSecure();

  initImageFallbacks();
  if ('IntersectionObserver' in window) lazyLoadImages();
  initSlideshow();

  // أزرار CTA
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) ctaButton.addEventListener('click', (e) => { e.preventDefault(); showOrderForm(); });
  const floatingCTABtn = document.getElementById('floatingCTABtn');
  if (floatingCTABtn) floatingCTABtn.addEventListener('click', (e) => { e.preventDefault(); showOrderForm(); });

  // تبديل اللغة
  const arBtn = document.getElementById('ar-btn');
  const frBtn = document.getElementById('fr-btn');
  if (arBtn) arBtn.addEventListener('click', () => switchLanguage('ar'));
  if (frBtn) frBtn.addEventListener('click', () => switchLanguage('fr'));

  // كمية القطع
  const decreaseBtn = document.getElementById('headerDecreaseBtn');
  const increaseBtn = document.getElementById('headerIncreaseBtn');
  if (decreaseBtn) decreaseBtn.addEventListener('click', () => { const q = parseInt(document.getElementById('quantity').value) || 1; updateQuantity(q - 1); });
  if (increaseBtn) increaseBtn.addEventListener('click', () => { const q = parseInt(document.getElementById('quantity').value) || 1; updateQuantity(q + 1); });

  // الولاية/نوع التوصيل
  const wilayaSelect = document.getElementById('wilaya');
  const deliveryTypeSelect = document.getElementById('delivery_type');
  if (wilayaSelect) wilayaSelect.addEventListener('change', (e) => { populateCommunes(e.target.value); updatePriceDisplay(); });
  if (deliveryTypeSelect) deliveryTypeSelect.addEventListener('change', updatePriceDisplay);

  // إظهار/إخفاء CTA العائم
  const debouncedScrollHandler = debounce(() => { toggleFloatingCTA(); }, 16);
  window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
  window.addEventListener('resize', toggleFloatingCTA);

  // فحص رقم الهاتف لحظيًا
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      const lang = getLang();
      const text = i18n[lang];
      const phoneStatus = document.getElementById('phoneStatus');
      this.value = this.value.replace(/[^0-9]/g, '');
      const phone = this.value;
      if (phone.length === 0) { phoneInput.classList.remove('valid','invalid'); if (phoneStatus) phoneStatus.style.display = 'none'; return; }
      if (phone.length < 10) {
        phoneInput.classList.remove('valid'); phoneInput.classList.add('invalid');
        if (phoneStatus) { phoneStatus.textContent = text.phoneHintShort; phoneStatus.className = 'phone-status error'; phoneStatus.style.display = 'block'; }
        return;
      }
      if (!validatePhoneAdvanced(phone)) {
        phoneInput.classList.remove('valid'); phoneInput.classList.add('invalid');
        if (phoneStatus) { phoneStatus.textContent = text.phoneHintPrefix; phoneStatus.className = 'phone-status error'; phoneStatus.style.display = 'block'; }
      } else {
        phoneInput.classList.remove('invalid'); phoneInput.classList.add('valid');
        if (phoneStatus) { phoneStatus.textContent = text.phoneHintOk; phoneStatus.className = 'phone-status success'; phoneStatus.style.display = 'block'; }
      }
    });
  }

  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmissionSecure);

  // تهيئة الصفحة
  updateQuantity(1);
  translateByDataAttrs(getLang());
  renderTestimonials(getLang());
  switchLanguage(getLang());
  updateHeaderPrice();
  updatePriceDisplay();
  updateFinalPriceAmount();
  updateFloatingCTA();
  toggleFloatingCTA();
  trackViewContent();

  // Service Worker (اختياري)
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        setInterval(() => { if (reg.active) reg.active.postMessage({ type: 'CLEANUP_CACHE' }); }, 24 * 60 * 60 * 1000);
      }).catch(() => {});
    });
  }

  console.log('✅ Dermevia Secure App Loaded (testimonials rendered by language)');
});

// =========== HELPERS ===========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function populateCommunes(wilayaCode) {
  const communeSelect = document.getElementById('commune');
  if (!communeSelect) return;
  communeSelect.innerHTML = `<option value="" id="selectCommune">${i18n[getLang()].selectCommune}</option>`;
  if (!wilayaCode || !communesData[wilayaCode]) return;
  communesData[wilayaCode].forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    communeSelect.appendChild(opt);
  });
}

// =========== ERROR HANDLING ===========
window.addEventListener('error', (e) => { if (CONFIG.DEBUG_MODE) console.error('Full error details:', e); });
window.addEventListener('unhandledrejection', (e) => { e.preventDefault(); if (CONFIG.DEBUG_MODE) console.error('Promise rejection:', e); });

// =========== EXPORT GLOBALS FOR HTML ===========
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.openModal = openModal;
window.closeModal = closeModal;
window.modalPrev = modalPrev;
window.modalNext = modalNext;

console.log('🔧 Dermevia App - i18n + testimonials dynamic');