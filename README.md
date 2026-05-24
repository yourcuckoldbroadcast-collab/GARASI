# Garasi Log — PWA Catatan Servis Kendaraan

Aplikasi web offline, gratis, tanpa server. Semua data tersimpan **di perangkat** (penyimpanan browser). Multi-kendaraan, multi-pengingat, hitung sisa km otomatis, indikator warna, export/import JSON.

## Isi paket
- `index.html` — seluruh aplikasi (HTML + CSS + JS)
- `manifest.json` — identitas PWA (nama, ikon, warna)
- `sw.js` — service worker (bikin app jalan 100% offline)
- `icon-192.png`, `icon-512.png`, `icon-48.png` — ikon aplikasi

> Penting: ketiga file ini harus berada **dalam satu folder yang sama**, dan disajikan lewat **HTTPS** agar fitur PWA (install + offline) aktif. Buka lewat `file://` tetap bisa, tapi service worker & "Add to Home Screen" tidak akan berfungsi penuh.

## Cara hosting (pilih salah satu — semua gratis)

### A. GitHub Pages
1. Buat repo baru, upload ke-6 file di atas (taruh di root repo).
2. Settings → Pages → Source: branch `main`, folder `/root` → Save.
3. Tunggu ~1 menit, buka URL `https://USERNAME.github.io/NAMA-REPO/`.

### B. Netlify / Cloudflare Pages (paling cepat)
1. Buka app.netlify.com (atau pages.cloudflare.com), login.
2. Drag-and-drop **folder** `garasi` ini ke area "deploy".
3. Dapat URL HTTPS langsung. Selesai.

## Cara pasang di HP (Android)
1. Buka URL HTTPS-nya di **Chrome / Firefox Android**.
2. Akan muncul banner "Pasang" — tap. (Atau menu browser → "Tambah ke layar utama".)
3. Ikon Garasi muncul di home screen, buka full-screen seperti app biasa, dan jalan offline.

## Backup (WAJIB rutin)
Menu (titik tiga) → **Export data** → file `.json` terunduh. Simpan di Google Drive.
Untuk pulihkan: Menu → **Import data** → pilih file backup.

Data lokal bisa hilang jika kamu menghapus data situs/aplikasi, jadi biasakan export berkala.
