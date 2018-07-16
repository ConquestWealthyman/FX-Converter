//This is the service worker with the Cache-first network

var CACHE = 'pwabuilder-precache';
var precacheFiles = [
      /* Add an array of files to precache for your app */
	'index.html',
	'css/index.css',
	'js/index.js',
	'js/manup.js',
	'img/favicon.png',
	'img/logo.png',
	'manifest.json',
	'https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css',
	'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js',
	'https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js',
	'https://free.currencyconverterapi.com/api/v5/currencies',
	'https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js',
	'https://fonts.googleapis.com/css?family=Righteous',
	'https://fonts.googleapis.com/icon?family=Material+Icons'
    ];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(evt) {
  console.log('[FX-Converter] The service worker is being installed.');
  evt.waitUntil(precache().then(function() {
    console.log('[FX-Converter] Skip waiting on install');
    return self.skipWaiting();
  }));
});


//allow sw to control of current page
self.addEventListener('activate', function(event) {
  console.log('[FX-Converter] Claiming clients for current page');
  return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  console.log('[FX-Converter] The service worker is serving the asset.'+ evt.request.url);
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request){
  //this is the fallback if it is not in the cache to go to the server and get it
  return fetch(request).then(function(response){ return response});
}
