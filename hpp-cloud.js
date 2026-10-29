// Lapisan data: login (Firebase Authentication) dan penyimpanan (Cloud Firestore).
// Dipakai bersama oleh semua halaman.
//
// Peran:
//  - admin   : ada dokumen  admins/<uid>  (dibuat manual lewat Firebase Console). Akses penuh.
//  - pemodal : akun lain yang sudah login. Hanya bisa MELIHAT file yang dibagikan ke akunnya.
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configured = !!firebaseConfig.apiKey && !/ISI_/i.test(JSON.stringify(firebaseConfig));

let auth = null;
let db = null;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Firebase login butuh format email. Username diubah jadi alamat palsu
// (.invalid = domain yang pasti tidak ada, jadi tidak bisa diambil alih orang lain).
const DOMAIN = "@hpp-tracker.invalid";
export const toEmail = (u) => {
  u = String(u || "").trim().toLowerCase();
  return u.includes("@") ? u : u + DOMAIN;
};
export const nameOf = (user) => {
  const e = (user && user.email) || "";
  return e.endsWith(DOMAIN) ? e.slice(0, -DOMAIN.length) : e;
};

export const ready = configured
  ? new Promise((resolve) => {
      const off = onAuthStateChanged(auth, (u) => { off(); resolve(u); });
    })
  : Promise.resolve(null);

export async function requireUser() {
  const u = await ready;
  if (!u) {
    location.replace("login.html");
    return new Promise(() => {});
  }
  return u;
}

export const login = (username, password) => signInWithEmailAndPassword(auth, toEmail(username), password);
export const logout = () => signOut(auth);

/* ---------- peran ---------- */
export async function getRole() {
  const s = await getDoc(doc(db, "admins", auth.currentUser.uid));
  return s.exists() ? "admin" : "member";
}

/* ---------- file HPP ---------- */
const toFile = (d) => {
  const x = d.data();
  return {
    id: d.id,
    name: x.name || "HPP",
    rows: Array.isArray(x.rows) ? x.rows : [],
    viewers: Array.isArray(x.viewers) ? x.viewers : [],
    ownerUid: x.ownerUid || "",
    updated: x.updated || 0,
    created: x.created || x.updated || 0
  };
};
const byCreated = (a, b) => a.created - b.created;

// admin: semua file. pemodal: hanya file yang membawa uid-nya di daftar viewers.
export async function fetchFiles(role) {
  const col = collection(db, "files");
  const snap = role === "admin"
    ? await getDocs(col)
    : await getDocs(query(col, where("viewers", "array-contains", auth.currentUser.uid)));
  return snap.docs.map(toFile).sort(byCreated);
}

export function pushFile(f) {
  return setDoc(doc(db, "files", f.id), {
    name: f.name,
    rows: f.rows,
    viewers: Array.isArray(f.viewers) ? f.viewers : [],
    ownerUid: f.ownerUid || auth.currentUser.uid,
    updated: f.updated,
    created: f.created || f.updated
  });
}

export function removeFile(id) {
  return deleteDoc(doc(db, "files", id));
}

// Data versi sebelumnya (users/<uid>/files) untuk dipindahkan sekali ke struktur baru.
export async function fetchLegacyCloudFiles() {
  const snap = await getDocs(collection(db, "users", auth.currentUser.uid, "files"));
  return snap.docs.map(toFile).sort(byCreated);
}

/* ---------- pemodal (khusus admin) ---------- */
export async function fetchMembers() {
  const snap = await getDocs(collection(db, "members"));
  return snap.docs
    .map((d) => {
      const x = d.data();
      return { uid: d.id, username: x.username || d.id, created: x.created || 0 };
    })
    .sort((a, b) => a.created - b.created);
}

// Membuat akun pemodal TANPA mengeluarkan admin: pendaftaran dilakukan lewat
// instance Firebase kedua, lalu dibuang.
export async function createMember(username, password) {
  const name = String(username || "").trim().toLowerCase();
  const secApp = initializeApp(firebaseConfig, "secondary-" + Date.now());
  const secAuth = getAuth(secApp);
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, toEmail(name), password);
    const uid = cred.user.uid;
    await setDoc(doc(db, "members", uid), { username: name, created: Date.now() });
    return { uid, username: name };
  } finally {
    try { await signOut(secAuth); } catch (e) { /* abaikan */ }
    try { await deleteApp(secApp); } catch (e) { /* abaikan */ }
  }
}

export function removeMember(uid) {
  return deleteDoc(doc(db, "members", uid));
}
