import { traerComentarios } from '../db.js';

export async function mostrarComentarios(categoria, container) {
  const comentarios = await traerComentarios(categoria);
  container.innerHTML = comentarios.map(c => `
    <div class="comentario">
      <strong class="puntuacion">${"★".repeat(c.calificacion)}</strong><br/>
      ${c.texto}<br/>
      <small>${c.fecha}</small>br/>
      <em style="font-size: 12px; color: gray;">Enviado por: ${'Anónimo'}</em>
    </div>
  `).join("");
}