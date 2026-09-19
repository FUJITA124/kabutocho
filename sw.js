/* 通信できないときのために、表示したものを控えておく。
   つながるときは必ず最新を取りに行くので、更新しても古い画面は残らない */
var CACHE = "kabutocho-v1";
var ASSETS = ["./", "./index.html", "./manifest.json",
              "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png",
              "./icon-180.png", "./icon-32.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
    .then(function () { return self.skipWaiting(); })
    .catch(function () {}));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) {
        return r || caches.match("./index.html");
      });
    })
  );
});