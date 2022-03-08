/*

TODO: it is stopped now, turn it on later

check this:
https://medium.com/@onejohi/offline-web-apps-using-local-storage-and-service-workers-5d40467117b9

*/

// importScripts('/cache-polyfill.js');

// const cacheName = 'jwkiosk';

// self.addEventListener('install', function (e) {
//     console.log('registering the service worker...');

//     e.waitUntil(
//         caches.open(cacheName).then(function (cache) {
//             return cache.addAll([
//                 '/',
//                 '/imgs/bbq_area.png',
//                 '/imgs/bottombanner.png',
//                 '/imgs/happy.gif',
//                 '/imgs/logo2.png',
//                 '/imgs/mainbackground.jpeg',
//                 '/imgs/neutral.gif',
//                 '/imgs/restaurant.png',
//                 '/imgs/slides.png',
//                 '/imgs/wc.png',
//                 '/css/locations.css',
//                 '/css/style.css',
//                 '/js/everywhere.js',
//                 '/js/home.js',
//                 '/js/js.cookie.js',
//                 '/js/locations.js',
//                 '/js/survey.js',
//                 '/cache-polyfill.js',
//                 '/survey/neutral/',
//                 '/survey/sad/',
//                 '/css/bootstrap-rtl.min.css',
//                 '/js/bootstrap.min.js',
//                 '/js/jquery.min.js'
//             ]);
//         })
//     );
// });

// self.addEventListener('fetch', function (event) {
//     console.log(event.request.url);

//     event.respondWith(
//         caches.match(event.request).then(function (response) {
//             return response || fetch(event.request);
//         })
//     );
// });

// self.addEventListener('activate', function(event) {

//     console.log('Service Worker: Activating....');

//     event.waitUntil(
//         caches.keys().then(function(cacheNames) {
//             return Promise.all(cacheNames.map(function(key) {
//                 if( key !== cacheName) {
//                     console.log('Service Worker: Removing Old Cache', key);
//                     return caches.delete(key);
//                 }
//             }));
//         })
//     );
//     return self.clients.claim();
// });