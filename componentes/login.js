import {auth, signInWithEmailAndPassword, signInWithPopup, googleProvider} from '../firebaseConfig.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const error = document.getElementById('error');

  document.getElementById('invitadoBtn').addEventListener('click', () => {
    localStorage.setItem("user", "invitado");
    window.location.href = "index.html";
  });

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("user", userCredential.user.email);
      window.location.href = "index.html";
    } catch (e) {
      error.textContent = "Error: " + e.message;
    }
  });

  document.getElementById('crearBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      error.textContent = "Ingresá un email y una contraseña para registrarte";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("user", userCredential.user.email);
      window.location.href = "index.html";
    } catch (e) {
      error.textContent = "Error al crear la cuenta: " + e.message;
    }
  });

  document.getElementById('googleBtn').addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("user", result.user.email);
      window.location.href = "index.html";
    } catch (e) {
      error.textContent = "Error: " + e.message;
    }
  });
});
