// تثبيت التطبيق
self.addEventListener('install', (e) => {
    console.log('[Service Worker] تم التثبيت');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('[Service Worker] تم التفعيل');
});

// هذا السطر ضروري جداً لكي يعتبر المتصفح موقعك تطبيقاً قابلاً للتثبيت PWA
self.addEventListener('fetch', (e) => {
    // لا نحتاج لعمل تخزين مؤقت هنا، فقط نتركه فارغاً ليمر الطلب بشكل طبيعي
});