# DATA HPP — Tracker

Web app sederhana buat catat Harga Pokok Penjualan (HPP) / modal barang: Nama Barang, Banyak, Satuan, Harga, Total (auto-hitung).

## Fitur
- Tambah/hapus baris barang
- Total per baris & grand total otomatis
- Simpan otomatis di browser (localStorage) — gak hilang walau refresh
- Export ke CSV (buat backup atau buka di Excel/Sheets)
- Import dari CSV

## Cara pakai
Buka `index.html` langsung di browser. Gak perlu install apa-apa, gak perlu server.

## Cara push ke GitHub

Repo ini sudah di-`git init` dan sudah ada 1 commit awal. Tinggal:

1. Buat repo baru (kosongan, tanpa README) di https://github.com/new — misal namanya `hpp-tracker`
2. Di terminal, masuk ke folder project ini, lalu jalankan:

```bash
git remote add origin https://github.com/USERNAME/hpp-tracker.git
git branch -M main
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.

3. (Opsional) Aktifkan **GitHub Pages** di Settings → Pages → pilih branch `main` biar app-nya bisa diakses online lewat link `https://USERNAME.github.io/hpp-tracker/`.

## Struktur

```
hpp-tracker/
├── index.html   # seluruh app (HTML+CSS+JS jadi satu file)
└── README.md
```

## Catatan
Data tersimpan per-browser (localStorage), bukan di cloud/database. Kalau ganti device atau clear browser data, data akan hilang kecuali sudah di-export CSV. Kalau nanti mau sinkron data lintas device (misal balik ke Google Sheets sebagai backend, atau pakai database), tinggal bilang — tinggal nambah lapisan sync di atas struktur ini.
