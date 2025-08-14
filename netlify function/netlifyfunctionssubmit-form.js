# ===================================================================
# DERMEVIA LABS - SECURITY HEADERS CONFIGURATION
# Advanced Protection Against Web Attacks
# ===================================================================

# ===================================================================
# GLOBAL SECURITY HEADERS - رؤوس الأمان العامة
# ===================================================================
/*
  # Content Security Policy - سياسة أمان المحتوى المحسنة
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.facebook.com https://api.ipify.org https://ipapi.co https://www.google.com https://www.gstatic.com blob: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:; img-src 'self' https: data: blob: https://picsum.photos https://www.facebook.com; connect-src 'self' https: wss: blob: data: https://api.ipify.org https://ipapi.co https://connect.facebook.net https://www.facebook.com; media-src 'self' https: blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;
  
  # Strict Transport Security - إجبار HTTPS
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  
  # منع تحديد نوع المحتوى تلقائياً
  X-Content-Type-Options: nosniff
  
  # منع عرض الموقع في إطارات خارجية
  X-Frame-Options: DENY
  
  # تفعيل حماية XSS المدمجة في المتصفح
  X-XSS-Protection: 1; mode=block
  
  # التحكم في المرجع المرسل
  Referrer-Policy: strict-origin-when-cross-origin
  
  # سياسة الأذونات للميزات الحساسة
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), fullscreen=(self), display-capture=()
  
  # إزالة معلومات الخادم
  Server: 
  X-Powered-By: 
  
  # منع التخزين المؤقت للصفحات الديناميكية
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
  
  # حماية إضافية
  X-DNS-Prefetch-Control: off
  X-Download-Options: noopen
  X-Permitted-Cross-Domain-Policies: none
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

# ===================================================================
# STATIC ASSETS - الملفات الثابتة
# ===================================================================

# CSS Files
/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# JavaScript Files  
/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Images
/*.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable
  
/*.jpg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000, immutable
  
/*.jpeg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000, immutable
  
/*.gif
  Content-Type: image/gif
  Cache-Control: public, max-age=31536000, immutable
  
/*.webp
  Content-Type: image/webp
  Cache-Control: public, max-age=31536000, immutable
  
/*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Fonts
/*.woff
  Content-Type: font/woff
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  
/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  
/*.ttf
  Content-Type: font/ttf
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  
/*.eot
  Content-Type: font/eot
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# ===================================================================
# API ENDPOINTS - نقاط API
# ===================================================================
/.netlify/functions/*
  # CORS Headers
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Forwarded-For, User-Agent
  Access-Control-Max-Age: 86400
  Access-Control-Allow-Credentials: false
  
  # Security Headers for APIs
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: no-referrer
  
  # Prevent API caching
  Cache-Control: no-cache, no-store, must-revalidate, private
  Pragma: no-cache
  Expires: 0
  
  # Rate limiting headers (سيتم تعيينها بواسطة الدوال)
  X-RateLimit-Limit: 100
  X-RateLimit-Window: 3600

# ===================================================================
# SENSITIVE FILES - الملفات الحساسة
# ===================================================================
/.env
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/.env.*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/package.json
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/package-lock.json
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/netlify.toml
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/.htaccess
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

# ===================================================================
# SEO & CRAWLERS - محركات البحث
# ===================================================================
/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
  
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
  
/sitemap*.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

# Favicon and Icons
/favicon.ico
  Content-Type: image/x-icon
  Cache-Control: public, max-age=2592000
  
/favicon.png
  Content-Type: image/png
  Cache-Control: public, max-age=2592000
  
/apple-touch-icon*.png
  Content-Type: image/png
  Cache-Control: public, max-age=2592000
  
/android-chrome*.png
  Content-Type: image/png
  Cache-Control: public, max-age=2592000

# ===================================================================
# SPECIAL PAGES - صفحات خاصة
# ===================================================================
/order.html
  Cache-Control: no-cache, no-store, must-revalidate
  X-Robots-Tag: noindex, nofollow
  
/error.html
  Cache-Control: public, max-age=300
  X-Robots-Tag: noindex, nofollow

# ===================================================================
# MANIFEST FILES - ملفات البيان
# ===================================================================
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600
  
/site.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600
  
/browserconfig.xml
  Content-Type: application/xml
  Cache-Control: public, max-age=3600

# ===================================================================
# SECURITY TESTING - اختبار الأمان
# ===================================================================
/.well-known/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=0
  
/security.txt
  Content-Type: text/plain
  Cache-Control: public, max-age=86400

# ===================================================================
# DEVELOPMENT FILES - ملفات التطوير
# ===================================================================
/README.md
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache
  
/LICENSE
  Content-Type: text/plain
  Cache-Control: public, max-age=86400

# ===================================================================
# BLOCKED PATHS - المسارات المحجوبة
# ===================================================================
/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/wp-admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/config/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/database/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate
  
/backup/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache, no-store, must-revalidate

# ===================================================================
# PERFORMANCE HEADERS - رؤوس الأداء
# ===================================================================
/*
  # DNS Prefetching
  X-DNS-Prefetch-Control: on
  
  # Connection Keep-Alive
  Connection: keep-alive
  
  # Resource Hints
  Link: <https://fonts.googleapis.com>; rel=preconnect; crossorigin, <https://fonts.gstatic.com>; rel=preconnect; crossorigin
  
  # Early Hints for Critical Resources
  # Link: </styles.css>; rel=preload; as=style
  # Link: </app.js>; rel=preload; as=script

# ===================================================================
# MOBILE OPTIMIZATION - تحسين الهاتف المحمول
# ===================================================================
/*
  # Viewport Meta (يتم التحكم فيه في HTML)
  # X-UA-Compatible: IE=edge (للتوافق مع IE القديم)
  
# ===================================================================
# ANALYTICS & TRACKING - التتبع والتحليلات
# ===================================================================
# السماح لـ Facebook Pixel و Google Analytics
/*.js
  # إذا كان الملف يحتوي على كود التتبع
  Content-Security-Policy: script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com

# ===================================================================
# END OF SECURITY HEADERS CONFIGURATION
# ===================================================================

3. _redirects - قواعد إعادة التوجيه
# ===================================================================
# DERMEVIA LABS - REDIRECTS CONFIGURATION  
# Advanced URL Routing & Security Redirects
# ===================================================================

# ===================================================================
# SECURITY REDIRECTS - إعادة توجيه أمنية
# ===================================================================

# Block admin paths
/admin/*           /error.html    404
/wp-admin/*        /error.html    404
/wp-login.php      /error.html    404
/wp-content/*      /error.html    404
/wp-includes/*     /error.html    404
/cgi-bin/*         /error.html    404
/.htaccess         /error.html    404
/.env              /error.html    404
/.env.*            /error.html    404
/config/*          /error.html    404
/database/*        /error.html    404
/db/*              /error.html    404
/backup/*          /error.html    404
/backups/*         /error.html    404
/tmp/*             /error.html    404
/temp/*            /error.html    404
/cache/*           /error.html    404
/logs/*            /error.html    404
/log/*             /error.html    404
/includes/*        /error.html    404
/lib/*             /error.html    404
/src/*             /error.html    404
/node_modules/*    /error.html    404
/vendor/*          /error.html    404
/.git/*            /error.html    404

# Block suspicious file extensions
*.sql              /error.html    404
*.log              /error.html    404
*.bak              /error.html    404
*.backup           /error.html    404
*.old              /error.html    404
*.orig             /error.html    404
*.tmp              /error.html    404
*.temp             /error.html    404
*.conf             /error.html    404
*.config           /error.html    404
*.ini              /error.html    404
*.yml              /error.html    404
*.yaml             /error.html    404

# ===================================================================
# DOMAIN REDIRECTS - إعادة توجيه النطاق
# ===================================================================

# Force HTTPS (handled by Netlify automatically, but added for completeness)
http://zenabiodz.com/*     https://zenabiodz.com/:splat     301!
http://www.zenabiodz.com/* https://zenabiodz.com/:splat     301!

# Remove www subdomain
https://www.zenabiodz.com/* https://zenabiodz.com/:splat    301!

# ===================================================================
# SEO FRIENDLY REDIRECTS - إعادة توجيه ودية لمحركات البحث
# ===================================================================

# Clean URLs - إزالة .html من النهاية
/index.html        /              301
/order.html        /order         301
/error.html        /error         301

# Handle URLs with trailing slashes
/*                 /:splat        301

# ===================================================================
# LEGACY REDIRECTS - إعادة توجيه الروابط القديمة
# ===================================================================

# إذا كان لديك روابط قديمة من Google Apps Script
/submit            /.netlify/functions/submit-form    200
/api/submit        /.netlify/functions/submit-form    200
/form              /.netlify/functions/submit-form    200

# Product page redirects
/product           /              301
/products          /              301
/dermevia          /              301
/pureskin          /              301

# Contact redirects
/contact           /              301
/support           /              301

# ===================================================================
# LANGUAGE REDIRECTS - إعادة توجيه اللغات
# ===================================================================

# Arabic language (default)
/ar                /              301
/arabic            /              301

# French language  
/fr                /?lang=fr      301
/french            /?lang=fr      301
/francais          /?lang=fr      301

# ===================================================================
# API ENDPOINTS - نقاط الواجهة البرمجية
# ===================================================================

# Form submission
/api/submit-form   /.netlify/functions/submit-form    200
/submit-form       /.netlify/functions/submit-form    200

# Rate limit validation
/api/rate-limit    /.netlify/functions/validate-rate-limit    200
/rate-limit        /.netlify/functions/validate-rate-limit    200

# Health check
/api/health        /.netlify/functions/health-check   200
/health            /.netlify/functions/health-check   200
/ping              /.netlify/functions/health-check   200

# ===================================================================
# MOBILE REDIRECTS - إعادة توجيه الهاتف المحمول
# ===================================================================

# Keep mobile users on the same responsive site
/mobile/*          /              301
/m/*               /              301

# ===================================================================
# SOCIAL MEDIA REDIRECTS - إعادة توجيه وسائل التواصل
# ===================================================================

# Facebook
/facebook          https://facebook.com/dermevia       301
/fb                https://facebook.com/dermevia       301

# Instagram  
/instagram         https://instagram.com/dermevia      301
/ig                https://instagram.com/dermevia      301

# WhatsApp
/whatsapp          https://wa.me/213770453210          301
/wa                https://wa.me/213770453210          301

# Telegram
/telegram          https://t.me/dermevia               301
/tg                https://t.me/dermevia               301

# ===================================================================
# ECOMMERCE REDIRECTS - إعادة توجيه التجارة الإلكترونية
# ===================================================================

# Order tracking
/track             /order         301
/tracking          /order         301
/order-status      /order         301

# Checkout
/checkout          /              301
/cart              /              301
/buy               /              301
/purchase          /              301

# ===================================================================
# UTILITY REDIRECTS - إعادة توجيه المرافق
# ===================================================================

# Sitemap
/sitemap           /sitemap.xml   301

# Robots
/robots            /robots.txt    301

# Favicon
/favicon           /favicon.ico   301

# ===================================================================
# ERROR HANDLING - معالجة الأخطاء
# ===================================================================

# Custom 404 page
/*                 /error.html    404

# ===================================================================
# FUNCTIONAL REDIRECTS - إعادة توجيه وظيفية
# ===================================================================

# Newsletter signup
/newsletter        /              301
/subscribe         /              301

# Privacy policy
/privacy           /              301
/privacy-policy    /              301

# Terms of service
/terms             /              301
/terms-of-service  /              301

# About page
/about             /              301
/about-us          /              301

# ===================================================================
# REGIONAL REDIRECTS - إعادة توجيه إقليمية
# ===================================================================

# Algerian cities
/alger             /              301
/algiers           /              301
/oran              /              301
/constantine       /              301
/annaba            /              301

# Delivery areas
/delivery          /              301
/shipping          /              301
/livraison         /              301

# ===================================================================
# TESTING & DEVELOPMENT REDIRECTS - إعادة توجيه الاختبار والتطوير
# ===================================================================

# Development URLs
/dev/*             /error.html    404
/test/*            /error.html    404
/staging/*         /error.html    404
/preview/*         /error.html    404

# ===================================================================
# PROXIES & FORWARDS - البروكسيات والتوجيه
# ===================================================================

# External API proxies (if needed)
/api/ipify/*       https://api.ipify.org/:splat       200
/proxy/ip          https://api.ipify.org?format=json  200

# ===================================================================
# SPECIAL CASES - حالات خاصة
# ===================================================================

# Handle missing trailing slash for directories
/assets            /assets/       301
/images            /images/       301
/css               /css/          301
/js                /js/           301

# ===================================================================
# ANALYTICS & TRACKING REDIRECTS
# ===================================================================

# UTM parameter cleaning (preserve functionality)
# /?utm_*            /              301

# Clean referrer tracking
/ref/*             /              301
/r/*               /              301

# ===================================================================
# PERFORMANCE REDIRECTS - إعادة توجيه الأداء
# ===================================================================

# CDN redirects for assets (if using external CDN)
# /cdn/*             https://cdn.yoursite.com/:splat   301

# ===================================================================
# SECURITY TESTING REDIRECTS
# ===================================================================

# Security.txt
/.well-known/security.txt    /security.txt    200

# ===================================================================
# END OF REDIRECTS CONFIGURATION
# ===================================================================

# Note: Order matters! More specific rules should come before general ones
# The ! flag forces the redirect even if a file exists at that path
# Status codes: 301 (permanent), 302 (temporary), 200 (proxy/rewrite)