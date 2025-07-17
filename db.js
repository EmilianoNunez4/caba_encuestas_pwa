import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDktnfDVAwTjdLgApgx6jOiph8fCVVQsjY",
  authDomain: "caba-encuestas.firebaseapp.com",
  projectId: "caba-encuestas",
  storageBucket: "caba-encuestas.appspot.com",
  messagingSenderId: "938428364499",
  appId: "1:938428364499:web:200378af937b11af178626"
};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

// ✅ IndexedDB setup
let db;

export function inicializarDB() {
  const request = indexedDB.open("EncuestasCABA", 1);
  request.onupgradeneeded = (e) => {
    db = e.target.result;

    if (!db.objectStoreNames.contains("comentarios")) {
      db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("pendientes")) {
      db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
    }
  };
  request.onsuccess = (e) => {
    db = e.target.result;
  };
}

// ✅ Guardar comentario (online/offline)
export async function guardarComentario(categoria, comentario) {
  const datos = { ...comentario, categoria };

  if (navigator.onLine) {
    try {
      await addDoc(collection(dbFirestore, "comentarios"), datos);
      console.log("✅ Comentario guardado en Firestore");
    } catch (error) {
      console.error("❌ Error en Firestore, guardando offline:", error);
      await guardarComentarioOFF(datos);
    }
  } else {
    await guardarComentarioOFF(datos);
  }

  // Guardamos también en IndexedDB local para consulta rápida
  const tx = db.transaction("comentarios", "readwrite");
  tx.objectStore("comentarios").add(datos);
}

// ✅ Guardar comentario offline en "pendientes"
export function guardarComentarioOFF(datos) {
  return new Promise((resolve) => {
    const tx = db.transaction("pendientes", "readwrite");
    tx.objectStore("pendientes").add(datos);
    tx.oncomplete = () => {
      console.log("💾 Comentario guardado en 'pendientes'");
      resolve();
    };
  });
}

// ✅ Traer comentarios desde Firestore
export async function traerComentarios(categoria) {
  try {
    const q = query(
      collection(dbFirestore, "comentarios"),
      where("categoria", "==", categoria)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("❌ Error al traer desde Firestore:", error);

    // fallback offline
    return new Promise((resolve) => {
      const tx = db.transaction("comentarios", "readonly");
      const store = tx.objectStore("comentarios");
      const req = store.getAll();
      req.onsuccess = () => {
        const resultado = req.result.filter(c => c.categoria === categoria);
        console.warn("📦 Mostrando comentarios desde cache local");
        resolve(resultado);
      };
    });
  }
}

// ✅ Reenviar comentarios pendientes
export async function reenviarPendientes() {
  if (!db) return;

  const txLeer = db.transaction("pendientes", "readonly");
  const storeLeer = txLeer.objectStore("pendientes");
  const req = storeLeer.getAll();

  req.onsuccess = async () => {
    const pendientes = req.result;

    for (const comentario of pendientes) {
      try {
        await addDoc(collection(dbFirestore, "comentarios"), comentario);
        console.log("🔁 Comentario reenviado a Firestore");

        // eliminar del store
        const txBorrar = db.transaction("pendientes", "readwrite");
        txBorrar.objectStore("pendientes").delete(comentario.id);
      } catch (error) {
        console.error("❌ Error reenviando pendiente:", error);
      }
    }
  };
}
