// Isi nilai di dalam tanda kutip dengan data dari Firebase Console:
// Project settings (ikon roda gigi) > General > Your apps > Web app > firebaseConfig
// Jangan hapus kata "export" di baris pertama.

export const firebaseConfig = {
  apiKey: "AIzaSyC7TmrgnBv8CgTB1OdxVU1VluG9JuSquko",
  authDomain: "hpp-tracker-3d293.firebaseapp.com",
  projectId: "hpp-tracker-3d293",
  appId: "1:536396756482:web:39b6cb986498c46244991b"
};

// true  = halaman login menampilkan tombol "Buat akun" (pakai ini sekali saja untuk akun pertama)
// false = hanya bisa Masuk. Ganti ke false setelah akun lu jadi, lalu upload ulang file ini.
export const ALLOW_REGISTER = true;
