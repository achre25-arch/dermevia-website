// 'use strict';

// =========== ENHANCED SECURITY CONFIGURATION ===========
const CONFIG = {
  NETLIFY_FUNCTIONS_BASE: '/.netlify/functions',
  SUBMIT_ENDPOINT: '/.netlify/functions/submit-form',
  RATE_LIMIT_ENDPOINT: '/.netlify/functions/validate-rate-limit',
  PHONE_COOLDOWN_MS: 24 * 60 * 60 * 1000,
  MAX_ORDERS_PER_PHONE: 2,
  MAX_RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 25000,
  SECURITY_SALT: 'dermevia_2024_secure_salt',
  ENCRYPTION_KEY: 'dermevia_advanced_encryption',
  FALLBACK_VALIDATION: true,
  DEBUG_MODE: false
};

// ... ✅ جميع تعريفات communesData و i18n كما في نسختك الأصلية ...

// =========== GLOBAL STATE ===========
let clientIP = null;
let securityFingerprint = null;
let serverRateLimitCache = new Map();
let rateCountdownInterval = null;

// ... ✅ جميع دوال الفاليدايشن والسكيوريتي كما في نسختك الأصلية ...

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
      showServerRateLimitCountdown(localCheck.left, null);
      return;
    }

    const lang = getLang();
    const originalPrice = parseInt(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const finalPrice = calculateDiscountedPrice(originalPrice, quantity);
    const wilayaSelect = document.getElementById('wilaya');
    const wilayaOption = wilayaSelect.options[wilayaSelect.selectedIndex];
    const deliveryType = document.getElementById('delivery_type').value;
    const deliveryPrice = (deliveryType === 'home') ?
      parseInt(wilayaOption.dataset.homePrice) || 0 :
      parseInt(wilayaOption.dataset.officePrice) || 0;
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
      window.location.href = '/order.html';
      return;
    }

    resetButtonState(submitBtn);

    if (result.error === 'rate_limit') {
      // UPDATE: نمرر الرسالة القادمة من السيرفر
      showServerRateLimitCountdown(result.ttlMs, result.message);
      return;
    }
    if (result.error === 'validation') { showError('بيانات غير صحيحة.'); return; }
    if (result.error === 'timeout') { showError('انتهت مهلة الاتصال.'); return; }
    if (result.error === 'network') { showError(i18n[lang].networkError); return; }
    showError(i18n[lang].serverError);

  } catch (error) {
    resetButtonState(submitBtn);
    showError(i18n[getLang()].errorMessage);
  }
}

// ... ✅ باقي الدوال UI و Slideshow و Lang Switch مثل نسختك ...

// ✅ جعلنا event listener async لاستخدام await داخلها بدون أخطاء
document.addEventListener('DOMContentLoaded', async function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) e.preventDefault();
  });

  generateSecurityFingerprint();
  await fetchIPSecure();  // الآن يعمل بدون خطأ await

  initImageFallbacks();
  if ('IntersectionObserver' in window) lazyLoadImages();
  initSlideshow();

  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) ctaButton.addEventListener('click', (e) => { e.preventDefault(); showOrderForm(); });
  const floatingCTABtn = document.getElementById('floatingCTABtn');
  if (floatingCTABtn) floatingCTABtn.addEventListener('click', (e) => { e.preventDefault(); showOrderForm(); });

  // ✅ باقي روابط الأزرار وأحداث التفاعل كما في نسختك...
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmissionSecure);

  updateQuantity(1);
  switchLanguage(getLang());
  updateHeaderPrice();
  updatePriceDisplay();
  updateFloatingCTA();
  toggleFloatingCTA();
  trackViewContent();
});