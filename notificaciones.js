import { messaging } from './firebaseConfig.js';
import { getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

// ✅ Esperamos que cargue el DOM para asegurar que el botón existe
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("solicitarPermiso");
  const output = document.getElementById("token");

  if (!btn) {
    console.warn("No se encontró el botón con id 'solicitarPermiso'");
    return;
  }

  btn.addEventListener("click", async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Debés permitir notificaciones");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado");

      const token = await getToken(messaging, {
        vapidKey: "BF6XzSkOHnWkgskaKwAhVOik3RUKO_CRseeTxwvTA4LuA7bWTFgbjjIOPJn2e4JE6gcD6KCLdnme9XWIqK0q0JM",
        serviceWorkerRegistration: registration
      });

      console.log("🔑 Token generado:", token);
      if (output) output.textContent = "Token: " + token;
    } catch (err) {
      console.error("Error al obtener token:", err);
    }
  });

  // ✅ Escuchar notificaciones cuando la app está abierta
  onMessage(messaging, (payload) => {
    console.log("📩 Mensaje en primer plano:", payload);
    alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`);
  });
});
