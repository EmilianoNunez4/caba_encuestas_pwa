const CACHE_NAME = "caba-encuesta-cache-v5";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/db.js",
  "/componentes/rating.js",
  "/componentes/listaComentarios.js",
  "/manifest.json",
  "/assets/LOGOBA.png",
  "/assets/limpieza.jpg",
  "/assets/colectivo.jpg",
  "/assets/espacioverde.jpg",
  "/assets/eventos.jpg",
  "/assets/subte.jpg",
  "/assets/seguridad.jpg",
  "/assets/accesibilidad.jpeg",
  "/assets/icon.png",
  "/assets/fondo.jpg"
];  

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDktnfDVAwTjdLgApgx6jOiph8fCVVQsjY",
  authDomain: "caba-encuestas.firebaseapp.com",
  projectId: "caba-encuestas",
  storageBucket: "caba-encuestas.appspot.com",
  messagingSenderId: "938428364499",
  appId: "1:938428364499:web:200378af937b11af178626"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("Notificacion enviada en segundo plano");
  if (!payload.notification) {
    const notificationTitle = "Nueva notificación";
    const notificationOptions = { body: payload.data?.body || "Tienes un nuevo mensaje." };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});