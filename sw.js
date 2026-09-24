/* Service Worker GIATS Workspace.
 * Menyimpan kerangka aplikasi (halaman ini, ikon, manifest) agar bisa dibuka tanpa internet.
 * Isi aplikasi tetap dimuat dari Apps Script; Service Worker tidak bisa menyimpan halaman Google. */
var VERSI = 'gw-kerangka-1';
var BERKAS = ['./', './index.html', './manifest.webmanifest', './ikon-192.png', './ikon-512.png',
  './ikon-maskable-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  /* Jaringan dulu supaya perubahan langsung terpakai; bila gagal, pakai salinan tersimpan. */
  e.respondWith(fetch(r).then(function (res) {
    if (res.ok) { var salin = res.clone(); caches.open(VERSI).then(function (c) { c.put(r, salin); }); }
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (m) {
      return m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    });
  }));
});
