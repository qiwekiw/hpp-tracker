# Data HPP

Catat modal barang (HPP) dengan login dan dua peran.

- **Admin**: akses penuh (buat, ubah, hapus, bagikan, kelola pemodal).
- **Pemodal**: hanya melihat file HPP yang dibagikan admin ke akunnya.

## File
- `login.html` halaman masuk (tidak ada pendaftaran, akun dibuat admin)
- `index.html` Home
- `dashboard.html` ringkasan
- `pemodal.html` kelola akun pemodal (khusus admin)
- `hpp-cloud.js` penghubung login dan database
- `firebase-config.js` data Firebase milik sendiri (jangan ditimpa)

## Pasang peran admin dan aturan baru

1. Firebase Console > **Authentication > Users**, salin **User UID** akun admin.
2. **Firestore Database > Data > Start collection**. Collection ID: `admins`. Document ID: tempel UID tadi. Tambah field `role` (string) berisi `admin`. Save.
3. **Firestore Database > Rules**, ganti isinya dengan ini lalu **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }
    function isAdmin() {
      return signedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // daftar admin: hanya dibuat manual lewat Console
    match /admins/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow write: if false;
    }

    // daftar pemodal
    match /members/{uid} {
      allow read: if isAdmin() || (signedIn() && request.auth.uid == uid);
      allow write: if isAdmin();
    }

    // file HPP: admin penuh, pemodal hanya baca file yang dibagikan ke uid-nya
    match /files/{fileId} {
      allow read: if isAdmin() || (signedIn() && request.auth.uid in resource.data.viewers);
      allow write: if isAdmin();
    }

    // data versi lama (hanya dibaca untuk dipindahkan sekali)
    match /users/{uid}/{document=**} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow write: if false;
    }
  }
}
```

4. Upload `index.html`, `dashboard.html`, `login.html`, `pemodal.html`, `hpp-cloud.js` ke GitHub.
5. Login sebagai admin. Data lama otomatis pindah ke struktur baru.
6. Buka **Pemodal**, buat akun pemodal. Di Home pilih file lalu klik **Bagikan**.

## Catatan
- Jangan matikan "Enable create (sign-up)" di Firebase, karena admin membuat akun pemodal lewat jalur itu.
- Lupa password pemodal: reset atau hapus akun lewat Firebase Console > Authentication > Users.
