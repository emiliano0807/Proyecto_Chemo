const API_URL = "http://localhost:3000/api/productos";
const API_MERMA_URL = "http://localhost:3000/api/merma";

let productoEditandoId = null;
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    llenarSelectProductos();

    document.getElementById("productoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (productoEditandoId) {
            await actualizarProducto();
        } else {
            await agregarProducto();
        }
    });

    const mermaForm = document.getElementById("mermaForm");
    if (mermaForm) {
        mermaForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await registrarMerma();
        });
    }
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
        await llenarSelectProductos();
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
        await llenarSelectProductos();
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
    const stock_minimo = parseInt(document.getElementById("stock_minimo").value);
    const stock_maximo = parseInt(document.getElementById("stock_maximo").value);

    if (!nombre || isNaN(precio) || isNaN(stock_actual)) {
        alert("Completa los campos requeridos.");
        return null;
    }

    return { nombre, descripcion, precio, stock_actual, stock_minimo, stock_maximo };
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
                <div class="flex gap-2 mt-2">
                    <button onclick="editarProducto(${producto.id})"
                        class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button onclick="eliminarProducto(${producto.id})"
                        class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                    <button onclick="agregarAlCarrito(${producto.id})"
                        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1">
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
        document.getElementById("stock_minimo").value = producto.stock_minimo || "";
        document.getElementById("stock_maximo").value = producto.stock_maximo || "";

        productoEditandoId = id;
    } catch (error) {
        alert("Error al cargar datos del producto para edición.");
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!respuesta.ok) throw new Error("Error al eliminar producto");

        await cargarProductos();
        await llenarSelectProductos();
        alert("✅ Producto eliminado correctamente.");
    } catch (error) {
        alert("❌ No se pudo eliminar el producto.");
        console.error(error);
    }
}

async function llenarSelectProductos() {
    const select = document.getElementById("producto_merma");
    if (!select) return;

    select.innerHTML = "";

    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();

        productos.forEach(producto => {
            const option = document.createElement("option");
            option.value = producto.id;
            option.textContent = `${producto.nombre} (Stock: ${producto.stock_actual})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al llenar select de productos:", error);
    }
}

async function registrarMerma() {
    const productoId = document.getElementById("producto_merma").value;
    const cantidad = parseInt(document.getElementById("cantidad_merma").value);
    const motivo = document.getElementById("motivo_merma").value.trim();

    if (!productoId || isNaN(cantidad) || !motivo) {
        alert("Completa todos los campos de merma.");
        return;
    }

    try {
        const respuesta = await fetch(API_MERMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ producto_id: productoId, cantidad, motivo })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(`Error: ${resultado.error}`);
        } else {
            alert("✅ Merma registrada correctamente");
            document.getElementById("mermaForm").reset();
            await cargarProductos();
            await llenarSelectProductos();
        }
    } catch (error) {
        console.error("Error al registrar la merma:", error);
        alert("Hubo un error al registrar la merma.");
    }
}

// -------------------- CARRITO DE COMPRAS -----------------------

async function agregarAlCarrito(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado");

        const producto = await res.json();

        const existente = carrito.find(p => p.id === producto.id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
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

    carrito.forEach(p => {
        const item = document.createElement("li");
        item.className = "flex justify-between border-b pb-1";
        item.innerHTML = `
            <span>${p.nombre} x ${p.cantidad}</span>
            <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
        `;
        lista.appendChild(item);
        total += p.precio * p.cantidad;
    });

    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
}
// -------------------- FINALIZAR COMPRA -----------------------
document.getElementById("finalizarCompra").addEventListener("click", async () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    try {
        // Primero, actualizar el stock en la base de datos
        for (let producto of carrito) {
            const stockNuevo = producto.stock_actual - producto.cantidad;
            await actualizarStockProducto(producto.id, stockNuevo);
        }

        // Luego, generar la nota de remisión (puedes agregar un endpoint para ello)
        const nota = await generarNotaDeRemision(carrito);

        // Limpiar el carrito
        carrito = [];
        mostrarCarrito(); // Vuelve a actualizar el carrito vacío
        cargarProductos()

        // Mostrar mensaje de éxito
        alert(`Compra realizada con éxito. Nota de remisión: ${nota}`);
    } catch (error) {
        console.error("Error al finalizar la compra:", error);
        alert("Hubo un error al realizar la compra.");
    }
});

// Función para actualizar el stock de un producto
async function actualizarStockProducto(productoId, nuevoStock) {
    try {
        const res = await fetch(`${API_URL}/${productoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock_actual: nuevoStock })
        });

        if (!res.ok) {
            throw new Error("Error al actualizar stock.");
        }
    } catch (error) {
        throw new Error("Error al actualizar stock.");
    }
}

// Función para generar la nota de remisión (puedes enviarla por WhatsApp o Email)
async function generarNotaDeRemision(carrito) {
    try {
        const totalCompra = carrito.reduce((total, p) => total + p.precio * p.cantidad, 0);
        const iva = totalCompra * 0.16; // Suponiendo un IVA del 16%
        const totalConIva = totalCompra + iva;

        const nota = {
            productos: carrito.map(p => ({
                nombre: p.nombre,
                cantidad: p.cantidad,
                precio_unitario: p.precio,
                total_producto: p.precio * p.cantidad
            })),
            totalCompra,
            iva,
            totalConIva
        };

        // Aquí podrías enviar la nota de remisión a la API para enviarla por email/whatsapp
        const res = await fetch("http://localhost:3000/api/nota_remision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nota)
        });

        const resultado = await res.json();
        if (res.ok) {
            return resultado.nota_remision_id; // Retorna el ID de la nota o un mensaje
        } else {
            throw new Error("Error al generar la nota de remisión.");
        }
    } catch (error) {
        throw new Error("Hubo un problema al generar la nota de remisión.");
    }
}
