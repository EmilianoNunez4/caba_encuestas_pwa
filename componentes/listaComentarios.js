import { traerComentarios } from '../db.js';

export async function mostrarComentarios(categoria, container) {
  const comentarios = await traerComentarios(categoria);
  container.innerHTML = comentarios.map(c => `
    <div class="comentario">
      <strong class="puntuacion">${"★".repeat(c.calificacion)}</strong><br/>
      ${c.texto}<br/>
      <small>${new Date(c.fecha).toLocaleString()}</small><br/>
      <em style="font-size: 12px; color: gray;">Enviado por: ${c.email || 'Anónimo'}</em>
    </div>
  `).join("");
}