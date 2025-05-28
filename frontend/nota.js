document.addEventListener("DOMContentLoaded", () => {
  const nota = JSON.parse(localStorage.getItem("notaRemision"));
  if (!nota) {
    document.body.innerHTML = "<h3>No hay nota generada.</h3>";
    return;
  }

  document.getElementById("infoNota").innerHTML = `
    <p><strong>Folio:</strong> ${nota.folio}</p>
    <p><strong>Fecha:</strong> ${nota.fecha}</p>
  `;

  const tbody = document.querySelector("#tablaProductos tbody");
  nota.productos.forEach(prod => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.cantidad}</td>
      <td>$${prod.precio.toFixed(2)}</td>
      <td>$${(prod.precio * prod.cantidad).toFixed(2)}</td>
    `;
    tbody.appendChild(fila);
  });

  document.getElementById("totalNota").textContent = nota.total.toFixed(2);

  // Compartir por WhatsApp
  document.getElementById("btnWhatsapp").addEventListener("click", () => {
    const mensaje = generarTextoNota(nota);
    const numero = ""; // Puedes poner aquí el número destino o dejarlo vacío
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  });

  // Compartir por Email
  document.getElementById("btnEmail").addEventListener("click", () => {
    const mensaje = generarTextoNota(nota);
    const subject = `Nota de Remisión - Folio ${nota.folio}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mensaje)}`;
    window.location.href = mailto;
  });
});

function generarTextoNota(nota) {
  let texto = `🧾 NOTA DE REMISIÓN\nFolio: ${nota.folio}\nFecha: ${nota.fecha}\n\n`;
  nota.productos.forEach(p => {
    texto += `🛍️ ${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}\n`;
  });
  texto += `\n💰 Total: $${nota.total.toFixed(2)}\nGracias por su compra.`;
  return texto;
}
