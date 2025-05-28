// models/notaRemision.js
const { DataTypes } = require('sequelize');
const sequelize = require('../data/source'); // tu configuración Sequelize

const NotaRemision = sequelize.define('NotaRemision', {
    folio: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    productos: {
        type: DataTypes.JSON, // guardamos el carrito como JSON
        allowNull: false,
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'notas_remision'
});

module.exports = NotaRemision;
