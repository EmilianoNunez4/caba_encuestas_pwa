import { inicializarDB, guardarComentario, guardarComentarioOFF, reenviarPendientes } from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';

const content = document.getElementById('content');
const buttons = document.querySelectorAll('.tabs button');

const usuario = localStorage.getItem("user");
if (!usuario) {
  alert("Debes iniciar sesión o entrar como invitado.");
  window.location.href = "login.html";
}
const esInvitado = usuario === "invitado";

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const categoria = btn.dataset.tab;
    content.innerHTML = `
      <h2>${btn.textContent}</h2>
      <img src=${btn.dataset.img} class="descripcionIMG"/>
      <label class="coment">Dejanos tu comentario</label><br/>
      <textarea id="comentario"></textarea><br/>
      <label>Calificanos</label>
      <div id="calificacion"></div>
      <button id="submit">Enviar</button>
      <h3>Comentarios anteriores:</h3>
      <div id="comentarios"></div>
    `;
    crearRating(document.getElementById('calificacion'));

  document.getElementById('submit').addEventListener('click', async () => {
      if (esInvitado) {
          alert("Debes iniciar sesión para enviar un comentario.");
          return;
        }

      const texto = document.getElementById('comentario').value;
      const calificacion = document.querySelectorAll('.calificacion.selected').length;
      //ACA AGREGUE EL IF NAVIGATOR ONLINE PARA QUE FUNCIONE SIN CONEXION Y CON
        if (navigator.onLine) {
          await guardarComentario(categoria, { texto, calificacion, fecha: new Date().toISOString() });
        } else {
          await guardarComentarioOFF(categoria, { texto, calificacion, fecha: new Date().toISOString() });
            return content.textContent = 'Sin conexión. Guardado localmente.';
        }
      document.getElementById('comentario').value = "";
      mostrarComentarios(categoria, document.getElementById('comentarios'));
    });
    mostrarComentarios(categoria, document.getElementById('comentarios'));
  });
});

//ACA AGREGUE QUE REENVIENTE PENDIENTE CUANDO EL NAVEGADOR ESTE NE LINEA
window.addEventListener("online", () => {
  reenviarPendientes().then(() => {
    console.log("Comentarios pendientes reenviados correctamente");
  });
});

//esta es la instalacion del servis worker para que se registre en el navegador y pueda trabajar on y off -line
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.error('Error al registrar el Service Worker:', err));
  });
}

inicializarDB();
window.addEventListener('DOMContentLoaded', () => {
  if (buttons.length > 0) {
    buttons[0].dispatchEvent(new Event('click'));
  }
});
