window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("solicitarPermiso");

  if (!btn) {
    console.log("❌ Botón no encontrado");
    return;
  }

  console.log("✅ Botón encontrado");
  btn.addEventListener("click", () => {
    alert("🎉 Botón presionado correctamente");
  });
});
