# Data HPP

Catat modal barang (HPP) dengan login. Data tersimpan di Firebase (gratis), bisa dibuka dari HP atau komputer mana saja.

## File
- `login.html` halaman masuk
- `index.html` Home (catat barang, banyak file)
- `dashboard.html` ringkasan semua file
- `hpp-cloud.js` penghubung login dan database
- `firebase-config.js` isi data Firebase milik sendiri

## Pasang Firebase (gratis, tanpa kartu kredit)

1. Buka https://console.firebase.google.com lalu **Create a project**. Nama bebas, Google Analytics boleh dimatikan.
2. **Build > Authentication > Get started > Sign-in method > Email/Password > Enable** (cukup toggle pertama), lalu Save.
3. **Build > Firestore Database > Create database**. Pilih lokasi `asia-southeast2` (Jakarta), mode **Production**. Setelah jadi, buka tab **Rules**, ganti isinya dengan ini, lalu **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

4. Klik ikon roda gigi > **Project settings > General > Your apps**, klik ikon web `</>`, kasih nama, **Register app**. Salin nilai `apiKey`, `authDomain`, `projectId`, `appId` ke `firebase-config.js`.
5. **Authentication > Settings > Authorized domains > Add domain**, isi `qiwekiw.github.io`.
6. Upload semua file ke GitHub, buka `https://qiwekiw.github.io/hpp-tracker/login.html`, klik **Belum punya akun? Buat akun**.
7. Setelah akun jadi, ubah `ALLOW_REGISTER` di `firebase-config.js` jadi `false`, upload ulang file itu.

## Catatan
- Data lama di browser lama otomatis ditawarkan pindah ke akun saat login pertama.
- Lupa password tidak bisa direset lewat email (username bukan email asli). Reset lewat Firebase Console > Authentication > Users.
- Rules di atas membuat tiap akun hanya bisa membaca dan menulis datanya sendiri.
