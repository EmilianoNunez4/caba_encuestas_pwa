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

export function guardarComentario(categoria, comentario) {
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readwrite");
    const store = tx.objectStore("comentarios");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;
  });
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

export function traerComentarios(categoria) {
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readonly");
    const store = tx.objectStore("comentarios");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.filter(c => c.categoria === categoria));
    };
  });
}

//AGREGUE ESTE QUE SIRVE PARA REENVIAR LOS COMENTS PENDIENTES
export async function reenviarPendientes() {
  const leerTx = db.transaction("pendientes", "readonly");
  const storeleer = leerTx.objectStore("pendientes");
  const request = storeleer.getAll();

  request.onsuccess = async () => {
    const pendientes = request.result;

    for (const comentario of pendientes) {
      // aca guarda el comentario pendiente en comentarios
      const txGuardar = db.transaction("comentarios", "readwrite");
      const storeGuardar = txGuardar.objectStore("comentarios");
      storeGuardar.add({ ...comentario });
      // y luego lo elimina de pendientes
      const txBorrar = db.transaction("pendientes", "readwrite");
      const storeBorrar = txBorrar.objectStore("pendientes");
      storeBorrar.delete(comentario.id);
    }
  };
} 

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

export async function guardarComentario(categoria, comentario) {
  try {
    await addDoc(collection(dbFirestore, "comentarios"), {
      ...comentario,
      categoria
    });
    console.log("Comentario guardado en Firestore");
  } catch (error) {
    console.error("Error al guardar comentario:", error);
  }
}

export async function traerComentarios(categoria) {
  try {
    const q = query(
      collection(dbFirestore, "comentarios"),
      where("categoria", "==", categoria)
    );

    const querySnapshot = await getDocs(q);
    const resultados = [];
    querySnapshot.forEach((doc) => {
      resultados.push(doc.data());
    });
    return resultados;
  } catch (error) {
    console.error("Error al traer comentarios:", error);
    return [];
  }
}