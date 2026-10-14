/* Service Worker GIATS Workspace.
 * Menyimpan kerangka aplikasi (halaman ini, ikon, manifest) agar bisa dibuka tanpa internet,
 * dan menampilkan pemberitahuan dorong (push).
 * Isi aplikasi tetap dimuat dari Apps Script; Service Worker tidak bisa menyimpan halaman Google. */
var VERSI = 'gw-kerangka-3';   /* dinaikkan 13 Okt 2026: pemberitahuan dorong */
var SIMPAN_PUSH = 'gw-push';   /* kunci langganan + alamat server; tidak ikut dibersihkan saat ganti versi */
var BERKAS = ['./', './index.html', './manifest.webmanifest', './ikon-192.png', './ikon-512.png',
  './ikon-maskable-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSI && k !== SIMPAN_PUSH; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  if (new URL(r.url).pathname.slice(-7) === '/__push') return;
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

/* ---------- pemberitahuan dorong ----------
 * Server mengirim push tanpa isi. Isi pesan diambil dari Apps Script memakai kunci
 * langganan yang disimpan index.html. Setiap push WAJIB menampilkan pemberitahuan
 * (Safari mencabut langganan yang diam), jadi bila pengambilan gagal tampil pesan umum. */
function bacaSetelanPush() {
  return caches.open(SIMPAN_PUSH).then(function (c) { return c.match('./__push'); })
    .then(function (r) { return r ? r.json() : null; }).catch(function () { return null; });
}
function ambilPesan(set) {
  if (!set || !set.kunci || !set.alamat) return Promise.resolve([]);
  return fetch(set.alamat, { method: 'POST', body: JSON.stringify({ push: 'ambil', kunci: set.kunci }) })
    .then(function (r) { return r.json(); })
    .then(function (h) { return (h && h.ok && h.pesan) || []; })
    .catch(function () { return []; });
}
self.addEventListener('push', function (e) {
  e.waitUntil(bacaSetelanPush().then(ambilPesan).then(function (daftar) {
    if (!daftar.length) daftar = [{ judul: 'GIATS Workspace', isi: 'Ada pemberitahuan baru. Ketuk untuk membuka.', app: '', tag: 'gw-umum' }];
    return Promise.all(daftar.map(function (p) {
      return self.registration.showNotification(String(p.judul || 'GIATS Workspace'), {
        body: String(p.isi || ''), icon: 'ikon-192.png', lang: 'id',
        tag: p.tag || undefined, renotify: !!p.tag, data: { app: String(p.app || '') }
      });
    }));
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var app = String((e.notification.data && e.notification.data.app) || '').replace(/[^a-z]/g, '');
  var tujuan = new URL(app ? './?app=' + app : './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ls) {
    for (var i = 0; i < ls.length; i++) {
      var c = ls[i];
      if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) {
        if (app && c.url !== tujuan && 'navigate' in c) return c.navigate(tujuan).then(function (w) { return w && w.focus(); }, function () { return c.focus(); });
        return c.focus();
      }
    }
    return self.clients.openWindow(tujuan);
  }));
});

/* Peramban kadang memperbarui langganan sendiri; alamat baru dilaporkan memakai kunci lama. */
self.addEventListener('pushsubscriptionchange', function (e) {
  e.waitUntil(bacaSetelanPush().then(function (set) {
    if (!set || !set.kunci) return;
    var lama = e.oldSubscription && e.oldSubscription.options;
    var baru = e.newSubscription ? Promise.resolve(e.newSubscription)
      : (lama && lama.applicationServerKey ? self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: lama.applicationServerKey }) : Promise.reject());
    return baru.then(function (s) {
      return fetch(set.alamat, { method: 'POST', body: JSON.stringify({ push: 'ganti', kunci: set.kunci, endpoint: s.endpoint }) });
    });
  }).catch(function () {}));
});
