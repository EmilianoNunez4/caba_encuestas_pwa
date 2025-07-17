import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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


let db;

export function inicializarDB() {
  const request = indexedDB.open("EncuestasCABA", 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("comentarios")) {
      db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
    } 
    //Agregue esto que es lo mismo de arriba pero con los msj pendientes guardados de manera offline
    if (!db.objectStoreNames.contains("pendientes")) {
      db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
    }
  };
  request.onsuccess = e => { db = e.target.result; };
}

// 🔥 Guardar comentario en Firestore
export async function guardarComentario(categoria, comentario) {
  try {
    await addDoc(collection(dbFirestore, "comentarios"), {
      ...comentario,
      categoria,
      fecha: new Date().toISOString()
    });
    console.log("✅ Comentario guardado en Firestore");
  } catch (error) {
    console.error("❌ Error al guardar comentario:", error);
  }
}

//agregue este que gvuarda los comentarios de manera ofline
export function guardarComentarioOFF(categoria, comentario) {
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;
  });
}

export async function traerComentarios(categoria) {
  try {
    const q = query(
      collection(dbFirestore, "comentarios"),
      where("categoria", "==", categoria)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("❌ Error al traer comentarios:", error);
    return [];
  }
}

//AGREGUE ESTE QUE SIRVE PARA REENVIAR LOS COMENTS PENDIENTES
export async function reenviarPendientes() {
  try {
    const leerTx = db.transaction("pendientes", "readonly");
    const storeleer = leerTx.objectStore("pendientes");
    const request = storeleer.getAll();

    request.onsuccess = async () => {
      const pendientes = request.result;
      console.log("📦 Comentarios pendientes:", pendientes);

      for (const comentario of pendientes) {
        try {
          await addDoc(collection(dbFirestore, "comentarios"), {
            ...comentario,
            fecha: new Date().toISOString()
          });

          const txBorrar = db.transaction("pendientes", "readwrite");
          const storeBorrar = txBorrar.objectStore("pendientes");
          storeBorrar.delete(comentario.id);

          console.log("✅ Comentario reenviado:", comentario);
        } catch (error) {
          console.error("❌ Error al reenviar comentario:", error);
        }
      }
    };

    request.onerror = (e) => {
      console.error("❌ Error leyendo IndexedDB:", e);
    };
  } catch (err) {
    console.error("❌ Falla general en reenviarPendientes:", err);
  }
}