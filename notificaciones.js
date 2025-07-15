import { messaging } from './firebaseConfig.js';
import {getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

document.getElementById("solicitarPermiso").addEventListener("click", async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return alert("Debés permitir notificaciones");

    const registration = await navigator.serviceWorker.register("/sw.js");

    const token = await getToken(messaging, {
      vapidKey: "TU_VAPID_KEY",
      serviceWorkerRegistration: registration
    });

    document.getElementById("token").textContent = "Token: " + token;
  } catch (err) {
    console.error("❌ Error al obtener token:", err);
  }
});

onMessage(messaging, (payload) => {
  console.log("📩 Mensaje en primer plano:", payload);
  alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`);
});