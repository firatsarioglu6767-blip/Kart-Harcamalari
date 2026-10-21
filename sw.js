// İnternet yokken de uygulama açılsın diye dosyaları önbelleğe alıyor.
// index.html'de bir şey değiştirip GitHub'a yüklersen SURUM'ü bir artır (v2, v3...).
var SURUM = "ek-kart-v1";
var DOSYALAR = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  // Eski sürümün önbelleğini temizle
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a !== SURUM; })
                            .map(function (a) { return caches.delete(a); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  // Önce internetten dene, olmazsa önbellekteki kopyayı ver
  e.respondWith(
    fetch(e.request).then(function (yanit) {
      var kopya = yanit.clone();
      caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
      return yanit;
    }).catch(function () { return caches.match(e.request); })
  );
});
