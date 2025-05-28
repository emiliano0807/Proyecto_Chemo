// services/notaRemisionService.js
const NotaRemision = require('../models/notaRemision');

const crearNotaRemision = async ({ folio, fecha, productos, total }) => {
    try {
        const nuevaNota = await NotaRemision.create({
            folio,
            fecha,
            productos,
            total
        });
        return nuevaNota;
    } catch (error) {
        throw new Error('Error al crear la nota de remisión: ' + error.message);
    }
};

const obtenerNotasRemision = async () => {
    try {
        return await NotaRemision.findAll();
    } catch (error) {
        throw new Error('Error al obtener notas de remisión: ' + error.message);
    }
};

module.exports = {
    crearNotaRemision,
    obtenerNotasRemision
};
