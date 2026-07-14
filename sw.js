/* Garasi Log — service worker
   Strategi: cache-first untuk app shell supaya aplikasi tetap berjalan offline.
   Naikkan versi CACHE setiap kali index.html, manifest.json, atau aset utama diperbarui. */

const CACHE = "garasi-log-v36";
const SHELL = "./index.html";

const ASSETS = [
  "./",
  SHELL,
  "./manifest.json",
  "./icon192.png",
  "./icon512.png",
  "./icon48.png"
];

/* Instalasi:
   index.html wajib berhasil dicache.
   Aset lain bersifat best-effort agar satu ikon yang hilang tidak menggagalkan instalasi. */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      // App shell wajib tersedia untuk penggunaan offline.
      await cache.add(SHELL);

      // Aset lainnya tidak boleh menggagalkan instalasi seluruh service worker.
      await Promise.allSettled(
        ASSETS
          .filter((url) => url !== SHELL)
          .map((url) => cache.add(url).catch(() => null))
      );

      await self.skipWaiting();
    })()
  );
});

/* Aktivasi:
   hapus cache versi lama dan langsung ambil kendali atas halaman yang terbuka. */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();

      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

/* Fetch:
   - Navigasi halaman memakai app shell dari cache.
   - Aset lain memakai cache-first, lalu jaringan sebagai cadangan.
   - Respons same-origin yang berhasil akan disimpan ke cache. */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  // Permintaan navigasi selalu diarahkan ke index.html agar PWA tetap berjalan offline.
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(SHELL).then((cachedShell) => {
        if (cachedShell) {
          return cachedShell;
        }

        return fetch(request).catch(() => caches.match(SHELL));
      })
    );

    return;
  }

  // Aset biasa: cache-first.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok &&
            new URL(request.url).origin === self.location.origin
          ) {
            const responseCopy = networkResponse.clone();

            caches.open(CACHE).then((cache) => {
              cache.put(request, responseCopy);
            });
          }

          return networkResponse;
        })
        .catch(() => caches.match(SHELL));
    })
  );
});
