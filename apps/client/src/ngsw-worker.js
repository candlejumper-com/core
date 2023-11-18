const CACHE_NAME = 'cache-v2';
const VERSION = '0.1';
const assetToCache = [
  // '/',
  // 'index.html',
  // '*.js',
  // '*.css',
  // '*.png',
  // '*.jpg',
  // '*.jpeg',
  // '*.svg',
  // '*.woff',
  // '*.woff2'
];

self.addEventListener('install', event => {
    log('INSTALLING ');
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache => cache.addAll(assetToCache))
        .catch(console.error)
    );
});

self.addEventListener('activate', event => {
    log('ACTIVATING');
    const activationCompleted = Promise.resolve().then(() => log('ACTIVATED'));
    event.waitUntil(activationCompleted);
});

// // Non-Caching version
// self.addEventListener('fetch', function(event) {
//   return fetch(event.request);
// });

// Caching version
// self.addEventListener('fetch', event => {
//   // Skip cross-origin requests, like those for Google Analytics.
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }
 
//         return caches.open(CACHE_NAME).then(cache => {
//           return fetch(event.request).then(response => {
//             // Put a copy of the response in the runtime cache.
//             return cache.put(event.request, response.clone()).then(() => response);
//           });
//         }).catch(console.error);
//       })
//     );
//   }
// });


// each logging line will be prepended with the service worker version
function log(message) {
    console.info('service-worker', 'v' + VERSION, message);
}