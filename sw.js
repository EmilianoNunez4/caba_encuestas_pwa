const CACHE_NAME = "caba-encuesta-cache-v4";
const FILES_TO_CACHE = [
  "/",
  "/encuestas.html",
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
  "/assets/fondo.png"
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
