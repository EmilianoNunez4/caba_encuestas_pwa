import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

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

document.getElementById("activarNotificaciones").addEventListener("click", async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BPb8gUBtvTM1XXi_D7pD_UR2Dzt089ztx_O4bbcoIUNypzYJACR8yXFB1WNtQwiirrV__Q1JCkO2cAWuNPtNb7g",
        serviceWorkerRegistration: await navigator.serviceWorker.register("firebase-messaging-sw.js"),
      });
      console.log("Token:", token);
      document.getElementById("token").textContent = `Token generado: ${token}`;
    } else {
      alert("Debés aceptar las notificaciones para poder recibir avisos.");
    }
  } catch (err) {
    console.error("Error al obtener el token FCM:", err);
  }
});

onMessage(messaging, (payload) => {
  const { title, body } = payload.notification;
  alert(`${title}\n${body}`);
});
