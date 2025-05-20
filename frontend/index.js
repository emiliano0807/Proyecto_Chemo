const API_URL = "http://localhost:3000/api/productos";

let productoEditandoId = null;
let carrito = [];

function obtenerRolUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    return usuario?.rol || null; // 'admin' o 'cliente'
}


document.addEventListener("DOMContentLoaded", () => {
        const rol = obtenerRolUsuario();

    if (rol === "cliente") {
        // Oculta el formulario de productos
        const form = document.getElementById("productoForm");
        if (form) form.style.display = "none";

        // Oculta el botón de finalizar compra si no es necesario
        const btn = document.getElementById("finalizarCompra");
        if (btn) btn.style.display = "block"; // los clientes sí pueden comprar

    } else if (rol === "admin") {
        // Mostrar todo
        const form = document.getElementById("productoForm");
        if (form) form.style.display = "block";
    }
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

async function obtenerDatosFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const stock_actual = parseInt(document.getElementById("stock_actual").value);
    const stock_minimo = parseInt(document.getElementById("stock_minimo").value);
    const stock_maximo = parseInt(document.getElementById("stock_maximo").value);

    if (!nombre || isNaN(precio) || isNaN(stock_actual)) {
        alert("Por favor completa todos los campos requeridos.");
        return;
    }

    try {
        // Verificar si ya existe un producto con el mismo nombre
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();

        const yaExiste = productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (yaExiste) {
            alert("Ya existe un producto con ese nombre.");
            return;
        }

        // Si no existe, crear
        const nuevoProducto = { nombre, descripcion, precio, stock_actual, stock_minimo, stock_maximo };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoProducto)
        });

        if (!res.ok) throw new Error("Error al crear el producto");

        document.getElementById("formularioProducto").reset();
        cargarProductos();
    } catch (error) {
        console.error("Error al crear producto:", error);
        alert("Ocurrió un error al crear el producto.");
    }
}

//

function limpiarFormulario() {
    document.getElementById("productoForm").reset();
    productoEditandoId = null;
}

async function cargarProductos() {
    const lista = document.getElementById("productoList");
    if (!lista) return;

    lista.innerHTML = "";
    const rol = obtenerRolUsuario();
    let botonesHTML = ""

    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        console.log("Respuesta del backend:", productos);


        productos.forEach((producto) => {
            const item = document.createElement("li");
            item.className = "bg-white p-4 rounded-lg shadow flex flex-col gap-2 border border-gray-200";

            const enCarrito = carrito.find(p => p.id === producto.id);
            const stockRestante = producto.stock_actual - (enCarrito?.cantidad || 0);

            item.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800">${producto.nombre}</h3>
                <p class="text-sm text-gray-600">${producto.descripcion || "Sin descripción"}</p>
                <p class="text-blue-700 font-semibold">Precio: $${producto.precio}</p>
                <p class="text-sm text-gray-700">Stock disponible: ${stockRestante}</p>
                <label class="text-sm mt-2">
                    Cantidad:
                    <select id="cantidad_${producto.id}" class="border rounded px-2 py-1 ml-2">
                        ${[...Array(stockRestante).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('') || '<option disabled>No disponible</option>'}
                    </select>
                </label>
            `;

            lista.appendChild(item);
            if (rol === "admin") {
    botonesHTML += `
        <button onclick="editarProducto(${producto.id})"
            class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1">
            <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button onclick="eliminarProducto(${producto.id})"
            class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1">
            <i class="bi bi-trash"></i> Eliminar
        </button>
    `;
}

// Todos pueden agregar al carrito
botonesHTML += `
    <button onclick="agregarAlCarrito(${producto.id})"
        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1">
        <i class="bi bi-cart-plus"></i> Añadir
    </button>
`;

item.innerHTML = `
    <h3 class="text-lg font-bold text-gray-800">${producto.nombre}</h3>
    <p class="text-sm text-gray-600">${producto.descripcion || "Sin descripción"}</p>
    <p class="text-blue-700 font-semibold">Precio: $${producto.precio}</p>
    <p class="text-sm text-gray-700">Stock disponible: ${stockRestante}</p>
    <label class="text-sm mt-2">
        Cantidad:
        <select id="cantidad_${producto.id}" class="border rounded px-2 py-1 ml-2">
            ${[...Array(stockRestante).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('') || '<option disabled>No disponible</option>'}
        </select>
    </label>
    <div class="flex gap-2 mt-2">
        ${botonesHTML}
    </div>
`;
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

// -------------------- CARRITO DE COMPRAS -----------------------

async function agregarAlCarrito(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado");

        const producto = await res.json();

        const cantidadSelect = document.getElementById(`cantidad_${id}`);
        const cantidad = parseInt(cantidadSelect.value);

        const existente = carrito.find(p => p.id === producto.id);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({ ...producto, cantidad });
        }

        mostrarCarrito();
        //cargarProductos(); // Actualizar el stock visible
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
        item.className = "flex justify-between items-center border-b py-2 gap-2 flex-wrap";

        const totalProducto = (p.precio * p.cantidad).toFixed(2);
        total += parseFloat(totalProducto);

        item.innerHTML = `
            <span class="flex-1">${p.nombre}</span>
            <input type="number" min="1" value="${p.cantidad}" class="w-16 border rounded px-1 text-center"
                onchange="cambiarCantidadEnCarrito(${index}, this.value)">
            <span class="w-24 text-right">$${totalProducto}</span>
            <button onclick="eliminarDelCarrito(${index})"
                class="ml-2 text-red-600 hover:text-red-800 text-sm">
                <i class="bi bi-x-circle-fill"></i>
            </button>
        `;
        lista.appendChild(item);
    });

    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
}

function cambiarCantidadEnCarrito(index, nuevaCantidad) {
    nuevaCantidad = parseInt(nuevaCantidad);
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        carrito[index].cantidad = nuevaCantidad;
    }
    mostrarCarrito();
    cargarProductos(); // Refrescar stock
}


function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarCarrito();
    cargarProductos(); // Refrescar stock
}

function vaciarCarrito() {
    carrito = [];
    mostrarCarrito();
    cargarProductos(); // Refrescar stock
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
// -------------------- Cierre de sesion -----------------------
function cerrarSesion() {
    localStorage.removeItem("usuario");
    alert("Has cerrado sesión.");
    window.location.href = "login.html"; // Redirigir a la página de inicio
}
