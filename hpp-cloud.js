// Lapisan data: login (Firebase Authentication) dan penyimpanan (Cloud Firestore).
// Dipakai bersama oleh login.html, index.html, dan dashboard.html.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDocs, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, ALLOW_REGISTER } from "./firebase-config.js";

export const configured = !!firebaseConfig.apiKey && !/ISI_/i.test(JSON.stringify(firebaseConfig));
export const allowRegister = !!ALLOW_REGISTER;

let auth = null;
let db = null;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Firebase login butuh format email. Username diubah jadi alamat palsu
// (.invalid = domain yang pasti tidak ada, jadi tidak bisa diambil alih orang lain).
// Kalau yang diketik sudah berupa email, dipakai apa adanya.
const DOMAIN = "@hpp-tracker.invalid";
export const toEmail = (u) => {
  u = String(u || "").trim().toLowerCase();
  return u.includes("@") ? u : u + DOMAIN;
};
export const nameOf = (user) => {
  const e = (user && user.email) || "";
  return e.endsWith(DOMAIN) ? e.slice(0, -DOMAIN.length) : e;
};

// Menunggu status login pertama dari Firebase (user atau null).
export const ready = configured
  ? new Promise((resolve) => {
      const off = onAuthStateChanged(auth, (u) => { off(); resolve(u); });
    })
  : Promise.resolve(null);

// Dipanggil halaman yang butuh login: kalau belum login, lempar ke login.html.
export async function requireUser() {
  const u = await ready;
  if (!u) {
    location.replace("login.html");
    return new Promise(() => {});
  }
  return u;
}

export const login = (username, password) => signInWithEmailAndPassword(auth, toEmail(username), password);
export const register = (username, password) => createUserWithEmailAndPassword(auth, toEmail(username), password);
export const logout = () => signOut(auth);

const filesCol = () => collection(db, "users", auth.currentUser.uid, "files");
const fileDoc = (id) => doc(db, "users", auth.currentUser.uid, "files", id);

export async function fetchFiles() {
  const snap = await getDocs(filesCol());
  return snap.docs
    .map((d) => {
      const x = d.data();
      return {
        id: d.id,
        name: x.name || "HPP",
        rows: Array.isArray(x.rows) ? x.rows : [],
        updated: x.updated || 0,
        created: x.created || x.updated || 0
      };
    })
    .sort((a, b) => a.created - b.created);
}

export function pushFile(f) {
  return setDoc(fileDoc(f.id), {
    name: f.name,
    rows: f.rows,
    updated: f.updated,
    created: f.created || f.updated
  });
}

export function removeFile(id) {
  return deleteDoc(fileDoc(id));
}
