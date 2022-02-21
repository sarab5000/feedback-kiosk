/*

It is stopped for now.
To be activated later.

*/

// importScripts('/cache-polyfill.js');

// const cacheName = 'jwkiosk';

// self.addEventListener('install', function (e) {
//     console.log('registering the service worker');

//     e.waitUntil(
//         caches.open(cacheName).then(function (cache) {
//             return cache.addAll([
//                 '/',
//                 '/imgs/logo2.png',
//                 '/survey/happy/',
//                 '/css/bootstrap-rtl.min.css'
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