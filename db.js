import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Configuración Firebase
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

// ✅ IndexedDB
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

// ✅ Guardar comentario online/offline
export async function guardarComentario(categoria, comentario) {
  const datos = { ...comentario, categoria };

  if (navigator.onLine) {
    try {
      console.log("📤 Enviando a Firestore:", datos);
      await addDoc(collection(dbFirestore, "comentarios"), datos);
      console.log("✅ Comentario guardado en Firestore");
    } catch (error) {
      console.error("❌ Error en Firestore. Guardando offline:", error);
      await guardarComentarioOFF(datos);
    }
  } else {
    console.warn("🌐 Sin conexión. Guardando en 'pendientes'");
    await guardarComentarioOFF(datos);
  }

  // Guardar también en cache local para mostrar sin conexión
  const tx = db.transaction("comentarios", "readwrite");
  tx.objectStore("comentarios").add(datos);
}

// ✅ Guardar en 'pendientes' si está offline o falla Firestore
export function guardarComentarioOFF(datos) {
  return new Promise((resolve) => {
    const tx = db.transaction("pendientes", "readwrite");
    tx.objectStore("pendientes").add(datos);
    tx.oncomplete = () => {
      console.log("💾 Guardado en IndexedDB → pendientes");
      resolve();
    };
  });
}

// ✅ Traer comentarios desde Firestore o fallback local
export async function traerComentarios(categoria) {
  try {
    const q = query(
      collection(dbFirestore, "comentarios"),
      where("categoria", "==", categoria)
    );
    const snapshot = await getDocs(q);
    const resultados = snapshot.docs.map(doc => doc.data());
    console.log("📥 Comentarios desde Firestore:", resultados);
    return resultados;
  } catch (error) {
    console.error("⚠️ Error al traer de Firestore. Usando local:", error);

    return new Promise((resolve) => {
      const tx = db.transaction("comentarios", "readonly");
      const store = tx.objectStore("comentarios");
      const req = store.getAll();
      req.onsuccess = () => {
        const filtrados = req.result.filter(c => c.categoria === categoria);
        console.warn("📦 Comentarios locales:", filtrados);
        resolve(filtrados);
      };
    });
  }
}

// ✅ Reenviar comentarios pendientes a Firestore
export async function reenviarPendientes() {
  if (!db) return;

  const txLeer = db.transaction("pendientes", "readonly");
  const store = txLeer.objectStore("pendientes");
  const req = store.getAll();

  req.onsuccess = async () => {
    const pendientes = req.result;

    for (const comentario of pendientes) {
      try {
        await addDoc(collection(dbFirestore, "comentarios"), comentario);
        console.log("🔁 Comentario reenviado:", comentario);

        const txBorrar = db.transaction("pendientes", "readwrite");
        txBorrar.objectStore("pendientes").delete(comentario.id);
      } catch (error) {
        console.error("❌ Error reenviando pendiente:", error);
      }
    }
  };
}
