import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

import { onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDktnfDVAwTjdLgApgx6jOiph8fCVVQsjY",
  authDomain: "caba-encuestas.firebaseapp.com",
  projectId: "caba-encuestas",
  storageBucket: "caba-encuestas.appspot.com",
  messagingSenderId: "938428364499",
  appId: "1:938428364499:web:200378af937b11af178626"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

document.getElementById("solicitarPermiso").addEventListener("click", async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BPb8gUBtvTM1XXi_D7pD_UR2Dzt089ztx_O4bbcoIUNypzYJACR8yXFB1WNtQwiirrV__Q1JCkO2cAWuNPtNb7g",
        serviceWorkerRegistration: await navigator.serviceWorker.register("firebase-messaging-sw.js"),
      });
      document.getElementById("token").textContent = "Token: " + token;
      console.log("Token:", token);
    } else {
      alert("Debés permitir las notificaciones para recibir avisos.");
    }
  } catch (error) {
    console.error("Error al obtener token:", error);
  }
});

onMessage(messaging, (payload) => {
  console.log("📩 Mensaje recibido en primer plano:", payload);
  const { title, body } = payload.notification;
  alert(`${title}\n${body}`);
});
