// controllers/remisionController.js
const remisionService = require('../services/remisionService');

exports.generarNotaDeRemision = async (req, res) => {
    try {
        const carrito = req.body.carrito; // [{ id, nombre, cantidad, precio, stock_actual }, ...]
        if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
            return res.status(400).json({ mensaje: "Carrito inválido" });
        }

        const nota = await remisionService.procesarCompra(carrito);
        res.status(200).json({ mensaje: "Compra realizada con éxito", nota });
    } catch (error) {
        console.error("Error en generarNotaDeRemision:", error);
        res.status(500).json({ mensaje: "Error al procesar la compra" });
    }
};
