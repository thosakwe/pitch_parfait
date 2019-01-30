self.addEventListener("fetch", function(event) {});

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("v1_parfait").then(function(cache) {
      return cache.addAll([
        "index.html",
        "parfait.css",
        "parfait.js",
        "logo.png"
      ]);
    })
  );
});
