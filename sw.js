// اسم الذاكرة المؤقتة (الكاش) وإصدارها المحدث
const CACHE_NAME = 'altaf-school-v3';

// قائمة الملفات والأصول المراد تخزينها للعمل أوفلاين
const STATIC_ASSETS = [
    './',
    './index.html',
    './welcome.html',
    './onboarding.html',
    './home.html',
    './parents.html',
    './login.html',
    './admin.html',
    './dashboard.html',
    './offline.html',
    './manifest.json',
    './style.css',
    
    // مشغلات ومكتبات الأنيميشن والخطوط والأيقونات الخارجية
    'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js',
    'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
    'https://b.top4top.io/p_3738g1q971.png',

    // ملفات أنيميشن Lottie المستخدمة في الصفحات
    'https://lottie.host/64274ba3-2047-4c43-b326-9beed6d442e8/SVmGWA4MFM.lottie', // أنيميشن الأوفلاين الجديد
    'https://lottie.host/a7722a60-a8c8-4757-8a57-b1358eee8bd8/0NctHm9jKz.lottie', // أنيميشن تسجيل الدخول
    'https://lottie.host/0dbc4ccd-6734-4740-9a4f-2179ecb0c289/wv9aFYb6z1.lottie', // أنيميشن الترحيب
    'https://lottie.host/a1d2d889-454a-4bfc-96c8-a13f59a71e36/iK47zRnvjF.lottie',
    'https://lottie.host/7633e1bb-5810-4883-894c-85c8a192f699/j9fJoilCsc.lottie',
    'https://lottie.host/83349f9a-76cb-4531-a059-4f6ee4d27060/TTvaHHSWnt.lottie',
    'https://lottie.host/f57fa894-1b11-4504-bae6-444d2848938d/KGuvLmpGsl.lottie',
    'https://lottie.host/df7eb503-bd4b-4601-b0d2-92a1b05df22a/oTNy9AO3ML.lottie'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات والأنيميشن في الكاش
self.addEventListener('install', (event) => {
    console.log('[Service Worker] جاري التثبيت وتخزين جميع الملفات والأنيميشن...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                STATIC_ASSETS.map(asset => cache.add(asset).catch(err => console.warn(`فشل تخزين: ${asset}`, err)))
            );
        }).then(() => self.skipWaiting())
    );
});

// 2. تفعيل الـ Service Worker وتنظيف الكاش القديم عند التحديث
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] تم التفعيل وتنظيف الذاكرة القديمة.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. معالجة الطلبات واستراتيجية الجلب أثناء تصفح المنصة
self.addEventListener('fetch', (event) => {
    // استثناء طلبات قاعدة البيانات (Supabase) ورفع الصور (ImgBB) لتبقى حية ومباشرة دائماً
    if (event.request.url.includes('supabase.co') || event.request.url.includes('api.imgbb.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // التوجيه الفوري لصفحة offline.html عند تصفح صفحة جديدة بدون إنترنت
                    if (event.request.mode === 'navigate') {
                        return caches.match('./offline.html');
                    }
                });
            })
    );
});