// services/remisionService.js
const db = require('../data/source'); // tu conexión a SQL Server o MySQL
const { v4: uuidv4 } = require('uuid');

exports.procesarCompra = async (carrito) => {
    const fecha = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const folio = uuidv4().slice(0, 8).toUpperCase(); // identificador simple
    let total = 0;

    for (let producto of carrito) {
        total += producto.precio * producto.cantidad;

        // Actualizar stock
        const nuevoStock = producto.stock_actual - producto.cantidad;
        await db.query("UPDATE productos SET stock_actual = ? WHERE id = ?", [nuevoStock, producto.id]);
    }

    // Guardar nota en tabla `remisiones`
    await db.query(
        "INSERT INTO remisiones (folio, fecha, total) VALUES (?, ?, ?)",
        [folio, fecha, total]
    );

    // Opcional: guardar detalle
    for (let producto of carrito) {
        await db.query(
            "INSERT INTO remision_detalle (folio, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
            [folio, producto.id, producto.cantidad, producto.precio]
        );
    }

    return folio;
};
