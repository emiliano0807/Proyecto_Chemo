const {
    crearProducto,
    obtenerProductos: obtenerTodosProductos, // Renombrado para evitar duplicados
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto
} = require("../services/productoService");

// Crear un nuevo producto
const crearProductoController = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock_actual, stock_minimo, stock_maximo } = req.body;

        if (!nombre || precio === undefined || stock_actual === undefined) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const nuevoProducto = await crearProducto(nombre, descripcion, precio, stock_actual, stock_minimo, stock_maximo);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los productos
const obtenerProductosController = async (req, res) => {
    try {
        const productos = await obtenerTodosProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un producto por ID
const obtenerProductoPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await obtenerProductoPorId(id);
        res.json(producto);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Actualizar un producto
const actualizarProductoController = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const productoActualizado = await actualizarProducto(id, datos);
        res.json({ message: "Producto actualizado correctamente", producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un producto
const eliminarProductoController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarProducto(id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    crearProductoController,
    obtenerProductosController,
    obtenerProductoPorIdController,
    actualizarProductoController,
    eliminarProductoController
};
