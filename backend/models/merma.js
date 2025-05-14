const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../data/source").sequelize;

const Merma = sequelize.define("Merma", {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: "merma",
    timestamps: false, // Si no tienes los campos 'createdAt' y 'updatedAt' en tu tabla
});

module.exports = Merma;
