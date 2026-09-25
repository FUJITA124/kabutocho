/* 通信できないときのために、表示したものを控えておく。
   つながるときは必ず最新を取りに行くので、更新しても古い画面は残らない */
var CACHE = "kabutocho-v2";
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
        if (r) return r;
        // 画面の読み込みだけアプリ本体で肩代わりする。
        // 何にでも index.html を返すと、外部への問い合わせの失敗がHTMLに化けて紛らわしい
        if (e.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});