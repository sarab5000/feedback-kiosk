/*

check this:
https://medium.com/@onejohi/offline-web-apps-using-local-storage-and-service-workers-5d40467117b9

*/

//Let check the database:
var FOLDER_NAME = 'post_requests'
var IDB_VERSION = 1
var form_data

importScripts('/cache-polyfill.js');

const cacheName = 'jwkiosk2';

self.addEventListener('install', function (e) {
    console.log('registering the service worker...');
    self.skipWaiting();
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([
                '/',
                '/survey/neutral/',
                '/survey/sad/',
                '/survey/neutral/restaurant',
                '/survey/neutral/wc',
                '/survey/neutral/slides',
                '/survey/neutral/bbq',
                '/survey/neutral/other',
                '/survey/sad/restaurant',
                '/survey/sad/wc',
                '/survey/sad/slides',
                '/survey/sad/bbq',
                '/survey/sad/other',
                '/imgs/bbq_area.png',
                '/imgs/bottombanner.png',
                '/imgs/happy.gif',
                '/imgs/logo2.png',
                '/imgs/mainbackground.jpeg',
                '/imgs/neutral.gif',
                '/imgs/other.png',
                '/imgs/restaurant.png',
                '/imgs/sad.gif',
                '/imgs/slides.png',
                '/imgs/wc.png',
                '/imgs/icon.png',
                '/css/locations.css',
                '/css/style.css',
                '/js/everywhere.js',
                '/js/home.js',
                '/js/js.cookie.js',
                '/js/locations.js',
                '/js/survey.js',
                '/cache-polyfill.js',
                '/css/bootstrap-rtl.min.css',
                '/js/bootstrap.min.js',
                '/js/jquery.min.js',
                '/js/axios.min.js',
                '/fonts/Amiri/Amiri-Bold.ttf'

            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker: Activating....');

    const existingCaches = await caches.keys();
    const invalidCaches = existingCaches.filter(c => c !== cacheName);
    await Promise.all(invalidCaches.map(ic => caches.delete(ic)));

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (key) {
                if (key !== cacheName) {
                    console.log('Service Worker: Removing Old Cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});


//---- Copied from internet -----

function getObjectStore(storeName, mode) {
    return our_db.transaction(storeName, mode).objectStore(storeName)
}

function savePostRequests(url, payload) {
    var request = getObjectStore(FOLDER_NAME, 'readwrite').add({
        url: url,
        payload: payload,
        method: 'POST'
    })
    request.onsuccess = function (event) {
        console.log('a new pos_ request has been added to indexedb')
    }

    request.onerror = function (error) {
        console.error(error)
    }
}

function openDatabase() {
    // if `jw-form` does not already exist in our browser (under our site), it is created
    var indexedDBOpenRequest = indexedDB.open('jw-form',)

    indexedDBOpenRequest.onerror = function (error) {
        // errpr creatimg db
        console.error('IndexedDB error:', error)
    }


    indexedDBOpenRequest.onupgradeneeded = function () {
        // This should only execute if there's a need to create/update db.
        this.result.createObjectStore(FOLDER_NAME, { autoIncrement: true, keyPath: 'id' })
    }

    // This will execute each time the database is opened.
    indexedDBOpenRequest.onsuccess = function () {
        our_db = this.result
    }
}

var our_db
openDatabase()

self.addEventListener('fetch', function (event) {
    // every request from our site, passes through the fetch handler
    // I have proof
    console.log('I am a request with url: ', event.request.clone().url)
    if (event.request.method === 'GET') {
        event.respondWith(
            // check all the caches in the browser and find
            // out whether our request is in any of them
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        // if we are here, that means there's a match
                        //return the response stored in browser
                        return response;
                    }
                    // no match in cache, use the network instead
                    return fetch(event.request);
                }
                )
        );
    } else if (event.request.clone().method === 'POST') {
        // attempt to send request normally
        console.log('form_data', form_data)
        event.respondWith(fetch(event.request.clone()).catch(function (error) {
            // only save post requests in browser, if an error occurs
            savePostRequests(event.request.clone().url, form_data)
        }))
    }
});

self.addEventListener('message', function (event) {
    console.log('form data', event.data)
    if (event.data.hasOwnProperty('form_data')) {
        // receives form data from script.js upon submission
        form_data = event.data.form_data
    }
})

function sendPostToServer() {
    var savedRequests = []
    var req = getObjectStore(FOLDER_NAME).openCursor() // FOLDERNAME = 'post_requests'

    req.onsuccess = async function (event) {
        var cursor = event.target.result

        if (cursor) {
            // Keep moving the cursor forward and collecting saved requests.
            savedRequests.push(cursor.value)
            cursor.continue()
        } else {
            // At this point, we have collected all the post requests in indexedb.
            for (let savedRequest of savedRequests) {
                // send them to the server one after the other
                console.log('saved request', savedRequest)
                var requestUrl = savedRequest.url
                var payload = JSON.stringify(savedRequest.payload)
                var method = savedRequest.method
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                } // if you have any other headers put them here
                fetch(requestUrl, {
                    headers: headers,
                    method: method,
                    body: payload
                }).then(function (response) {
                    console.log('server response', response)
                    if (response.status < 400) {
                        // If sending the POST request was successful, then remove it from the IndexedDB.
                        getObjectStore(FOLDER_NAME, 'readwrite').delete(savedRequest.id)
                    }
                }).catch(function (error) {
                    // This will be triggered if the network is still down. The request will be replayed again
                    // the next time the service worker starts up.
                    console.error('Send to Server failed:', error)
                    // since we are in a catch, it is important an error is thrown,
                    // so the background sync knows to keep retrying sendto server
                    throw error
                })
            }
        }
    }
}


self.addEventListener('sync', function (event) {
    console.log('now online')
    if (event.tag === 'sendFormData') { // event.tag name checked here must be the same as the one used while registering sync
        event.waitUntil(
            // Send our POST request to the server, now that the user is online
            sendPostToServer()
        )
    }
})