/* Garasi Log — service worker
   Strategi: cache-first untuk app shell supaya aplikasi tetap jalan 100% offline.
   Naikkan versi CACHE saat ada update file agar cache lama dibuang. */
const CACHE = "garasi-log-v26";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon192.png",
  "./icon512.png",
  "./icon48.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // simpan salinan untuk pemakaian offline berikutnya (hanya same-origin sukses)
          if (res && res.ok && new URL(req.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html")); // fallback navigasi saat offline
    })
  );
});
