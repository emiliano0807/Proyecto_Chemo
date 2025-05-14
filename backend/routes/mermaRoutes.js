const express = require("express");
const Merma = require("../models/merma");
const Producto = require("../models/producto"); // Asegúrate de tener el modelo de productos importado
const router = express.Router();

// Ruta para registrar una merma
router.post("/", async (req, res) => {
    const { producto_id, cantidad, motivo } = req.body;

    try {
        // Verificar si el producto existe
        const producto = await Producto.findByPk(producto_id);
        if (!producto) {
            return res.status(400).json({ error: "Producto no encontrado." });
        }

        // Verificar que la cantidad de la merma no sea mayor al stock disponible
        if (producto.stock_actual < cantidad) {
            return res.status(400).json({ error: "Stock insuficiente para registrar la merma." });
        }

        // Registrar la merma
        const merma = await Merma.create({
            producto_id,
            cantidad,
            motivo
        });

        // Actualizar el stock del producto
        producto.stock_actual -= cantidad;
        await producto.save();

        res.status(200).json({ message: "Merma registrada exitosamente", merma });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar la merma." });
    }
});

module.exports = router;
