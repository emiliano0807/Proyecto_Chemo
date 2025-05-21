const API_URL = "http://localhost:3000/api/productos"; 

let productoEditandoId = null;
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();

    const productoForm = document.getElementById("productoForm");
    if (productoForm) {
        productoForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (productoEditandoId) {
                await actualizarProducto();
            } else {
                await agregarProducto();
            }
        });
    }

    const finalizarBtn = document.getElementById("finalizarCompra");
    if (finalizarBtn) {
        finalizarBtn.addEventListener("click", async () => {
            if (carrito.length === 0) {
                alert("El carrito está vacío.");
                return;
            }

            try {
                for (let producto of carrito) {
                    const stockNuevo = producto.stock_actual - producto.cantidad;
                    await actualizarStockProducto(producto.id, stockNuevo);
                }

                const nota = await generarNotaDeRemision(carrito);
                generarPDFNota(nota, carrito); // Generar PDF

                carrito = [];
                mostrarCarrito();
                cargarProductos();

                alert(`Compra realizada con éxito. Nota de remisión: ${nota}`);
            } catch (error) {
                console.error("Error al finalizar la compra:", error);
                alert("Hubo un error al realizar la compra.");
            }
        });
    }
});

document.getElementById("enviarWhatsApp").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "*Nota de Remisión - Boutique TESJI*%0A";
    carrito.forEach(item => {
        const subtotal = (item.precio * item.cantidad).toFixed(2);
        mensaje += `• ${item.nombre} x${item.cantidad} - $${subtotal}%0A`;
    });

    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    const iva = total * 0.16;
    const totalConIVA = total + iva;

    mensaje += `%0AIVA: $${iva.toFixed(2)}%0ATotal: $${totalConIVA.toFixed(2)}`;

    const telefono = "525519195148";
    const url = `https://wa.me/${telefono}?text=${mensaje}`;

    window.open(url, "_blank");
});

document.getElementById("enviarEmail").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let cuerpo = "Nota de Remisión - Boutique TESJI%0A%0A";
    carrito.forEach(item => {
        const subtotal = (item.precio * item.cantidad).toFixed(2);
        cuerpo += `${item.nombre} x${item.cantidad} - $${subtotal}%0A`;
    });

    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    const iva = total * 0.16;
    const totalConIVA = total + iva;

    cuerpo += `%0AIVA: $${iva.toFixed(2)}%0ATotal: $${totalConIVA.toFixed(2)}`;

    const asunto = "Nota de Remisión Boutique TESJI";
    const correoDestino = "pame73175@gmail.com";

    const mailto = `mailto:${correoDestino}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
    window.open(mailto, "_blank");
});

async function agregarProducto() {
    const producto = obtenerDatosFormulario();
    if (!producto) return;

    try {
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        if (!respuesta.ok) throw new Error("Error al agregar producto.");

        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        alert(error.message);
    }
}

async function actualizarProducto() {
    const producto = obtenerDatosFormulario();
    if (!producto || !productoEditandoId) return;

    try {
        const respuesta = await fetch(`${API_URL}/${productoEditandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        if (!respuesta.ok) throw new Error("Error al actualizar producto.");

        limpiarFormulario();
        await cargarProductos();
        productoEditandoId = null;
    } catch (error) {
        alert(error.message);
    }
}

function obtenerDatosFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const stock_actual = parseInt(document.getElementById("stock_actual").value);

    if (!nombre || isNaN(precio) || isNaN(stock_actual)) {
        alert("Completa los campos requeridos.");
        return null;
    }

    return { nombre, descripcion, precio, stock_actual };
}

function limpiarFormulario() {
    document.getElementById("productoForm").reset();
    productoEditandoId = null;
}

async function cargarProductos() {
    const lista = document.getElementById("productoList");
    if (!lista) return;

    lista.innerHTML = "";

    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();

        productos.forEach((producto) => {
            const item = document.createElement("li");
            item.className = "bg-white p-4 rounded-lg shadow flex flex-col gap-2 border border-gray-200";

            item.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800">${producto.nombre}</h3>
                <p class="text-sm text-gray-600">${producto.descripcion || "Sin descripción"}</p>
                <p class="text-blue-700 font-semibold">Precio: $${producto.precio}</p>
                <p class="text-sm text-gray-700">Stock: ${producto.stock_actual}</p>
                <input type="number" id="cantidad-${producto.id}" min="1" value="1" class="border rounded px-2 py-1 w-20 mb-2" />
                <div class="flex gap-2">
                    <button onclick="editarProducto(${producto.id})" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button onclick="eliminarProducto(${producto.id})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                    <button onclick="agregarAlCarrito(${producto.id})" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1">
                        <i class="bi bi-cart-plus"></i> Añadir
                    </button>
                </div>
            `;

            lista.appendChild(item);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        lista.innerHTML = "<p class='text-red-600'>No se pudieron cargar los productos.</p>";
    }
}

async function editarProducto(id) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`);
        if (!respuesta.ok) throw new Error("No se pudo cargar el producto.");

        const producto = await respuesta.json();

        document.getElementById("nombre").value = producto.nombre;
        document.getElementById("descripcion").value = producto.descripcion || "";
        document.getElementById("precio").value = producto.precio;
        document.getElementById("stock_actual").value = producto.stock_actual;

        productoEditandoId = id;
    } catch (error) {
        alert("Error al cargar datos del producto para edición.");
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!respuesta.ok) throw new Error("Error al eliminar producto");

        await cargarProductos();
        alert("✅ Producto eliminado correctamente.");
    } catch (error) {
        alert("❌ No se pudo eliminar el producto.");
        console.error(error);
    }
}

async function agregarAlCarrito(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado");

        const producto = await res.json();
        const cantidadInput = document.getElementById(`cantidad-${id}`);
        const cantidad = parseInt(cantidadInput.value);

        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Cantidad inválida.");
            return;
        }

        if (cantidad > producto.stock_actual) {
            alert(`Solo hay ${producto.stock_actual} en stock.`);
            return;
        }

        const existente = carrito.find(p => p.id === producto.id);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({ ...producto, cantidad });
        }

        mostrarCarrito();
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    }
}

function mostrarCarrito() {
    const lista = document.getElementById("carritoLista");
    const totalDiv = document.getElementById("totalCarrito");

    if (!lista || !totalDiv) return;

    lista.innerHTML = "";
    let total = 0;

    carrito.forEach((p, index) => {
        const item = document.createElement("li");
        item.className = "flex justify-between items-center gap-2 border-b pb-1";

        const subtotal = (p.precio * p.cantidad).toFixed(2);
        total += parseFloat(subtotal);

        item.innerHTML = `
            <span class="w-1/3">${p.nombre}</span>
            <input type="number" min="1" value="${p.cantidad}" data-index="${index}" class="cantidad-carrito border px-2 w-16 text-center" />
            <span class="w-1/4 text-right">$${subtotal}</span>
            <button data-index="${index}" class="eliminar-producto text-red-600 hover:text-red-800 ml-2">
                <i class="bi bi-trash"></i>
            </button>
        `;

        lista.appendChild(item);
    });

    totalDiv.textContent = `Total: $${total.toFixed(2)}`;

    // Escuchar cambios en inputs de cantidad
    document.querySelectorAll(".cantidad-carrito").forEach(input => {
        input.addEventListener("change", (e) => {
            const index = parseInt(e.target.dataset.index);
            let nuevaCantidad = parseInt(e.target.value);

            if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
                alert("Cantidad inválida. Debe ser mayor a 0.");
                e.target.value = carrito[index].cantidad;
                return;
            }

            const maxStock = carrito[index].stock_actual;
            if (nuevaCantidad > maxStock) {
                alert(`No puedes agregar más de ${maxStock} unidades.`);
                e.target.value = carrito[index].cantidad;
                return;
            }

            carrito[index].cantidad = nuevaCantidad;
            mostrarCarrito();
        });
    });

    // Escuchar clicks en botones de eliminar
    document.querySelectorAll(".eliminar-producto").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            carrito.splice(index, 1);
            mostrarCarrito();
        });
    });
}


async function actualizarStockProducto(productoId, nuevoStock) {
    try {
        const res = await fetch(`${API_URL}/${productoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock_actual: nuevoStock })
        });

        if (!res.ok) throw new Error("Error al actualizar stock.");
    } catch (error) {
        throw new Error("Error al actualizar stock.");
    }
}

async function generarNotaDeRemision(carrito) {
    try {
        const totalCompra = carrito.reduce((total, p) => total + Number(p.precio) * p.cantidad, 0);
        const iva = totalCompra * 0.16;
        const totalConIva = totalCompra + iva;

        const nota = {
            productos: carrito.map(p => ({
                nombre: p.nombre,
                cantidad: p.cantidad,
                precio_unitario: Number(p.precio),
                total_producto: Number(p.precio) * p.cantidad
            })),
            totalCompra,
            iva,
            totalConIva
        };

        const res = await fetch("http://localhost:3000/api/nota_remision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nota)
        });

        const resultado = await res.json();
        if (res.ok) {
            return resultado.nota_remision_id;
        } else {
            throw new Error("Error al generar la nota de remisión.");
        }
    } catch (error) {
        throw new Error("Hubo un problema al generar la nota de remisión.");
    }
}

function generarPDFNota(notaId, carrito) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(16);
    doc.text("Nota de Remisión", 20, y);
    y += 10;

    doc.setFontSize(12);
    carrito.forEach(p => {
        doc.text(`${p.nombre} x ${p.cantidad} - $${Number(p.precio).toFixed(2)} c/u`, 20, y);
        y += 7;
    });

    const total = carrito.reduce((t, p) => t + Number(p.precio) * p.cantidad, 0);
    const iva = total * 0.16;
    const totalConIva = total + iva;

    y += 10;
    doc.text(`Subtotal: $${total.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`Total a pagar: $${totalConIva.toFixed(2)}`, 20, y);

    y += 10;
    doc.text(`Folio nota: ${notaId}`, 20, y);

    doc.save(`nota_remision_${notaId}.pdf`);
}
