/* Garasi Log — service worker
   Strategi: cache-first untuk app shell supaya aplikasi tetap jalan 100% offline.
   Naikkan versi CACHE saat ada update file agar cache lama dibuang. */
const CACHE = "garasi-log-v33";
const SHELL = "./index.html";                 // inti aplikasi — WAJIB tercache
const ASSETS = ["./", SHELL, "./manifest.json", "./icon192.png", "./icon512.png", "./icon48.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.add(SHELL);                        // shell harus masuk; bila gagal, install gagal (memang benar)
    // sisanya best-effort: SATU aset gagal (404/hiccup) tak boleh membatalkan precache & merusak offline
    await Promise.allSettled(
      ASSETS.filter((u) => u !== SHELL).map((u) => c.add(u).catch(() => {}))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Membuka aplikasi (navigasi): selalu sajikan shell dari cache → offline 100% andal,
  // apa pun start_url/URL-nya. Tetap cache-first sesuai strategi.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match(SHELL).then((shell) => shell || fetch(req).catch(() => caches.match(SHELL)))
    );
    return;
  }

  // Aset lain: cache-first, jaringan sebagai cadangan + simpan salinan same-origin.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          if (res && res.ok && new URL(req.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(SHELL))
    )
  );
});
