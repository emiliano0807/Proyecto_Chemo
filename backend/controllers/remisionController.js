// controllers/notaRemisionController.js
const { crearNotaRemision } = require('../services/remisionService');

const generarNotaDeRemision = async (req, res) => {
    try {
        const { carrito } = req.body;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ error: 'Carrito vacío' });
        }

        const folio = Date.now().toString();
        const fecha = new Date();
        const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

        const nuevaNota = await crearNotaRemision({
            folio,
            fecha,
            productos: carrito,
            total
        });

        res.status(201).json({ nota: nuevaNota });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    generarNotaDeRemision
};
