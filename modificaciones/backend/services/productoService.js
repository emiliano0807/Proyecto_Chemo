// services/productoService.js
const Producto = require("../models/producto");

const crearProducto = async (nombre, descripcion, precio, stock_actual) => {
    try {
        const nuevoProducto = await Producto.create({
            nombre,
            descripcion,
            precio,
            stock_actual
        });
        return nuevoProducto;
    } catch (error) {
        throw new Error("Error al crear el producto: " + error.message);
    }
};

const obtenerProductos = async () => {
    try {
        return await Producto.findAll();
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error.message);
    }
};

const obtenerProductoPorId = async (id) => {
    try {
        return await Producto.findByPk(id);
    } catch (error) {
        throw new Error("Error al obtener el producto: " + error.message);
    }
};

const actualizarProducto = async (id, datosActualizados) => {
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) throw new Error("Producto no encontrado");

        await producto.update(datosActualizados);
        return producto;
    } catch (error) {
        throw new Error("Error al actualizar el producto: " + error.message);
    }
};

const eliminarProducto = async (id) => {
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) throw new Error("Producto no encontrado");

        await producto.destroy();
        return { message: "Producto eliminado correctamente" };
    } catch (error) {
        throw new Error("Error al eliminar el producto: " + error.message);
    }
};

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto
};
