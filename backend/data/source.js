const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("punto_venta_ropa", "root", "Volcan5678", {
    host: "localhost",
    dialect: "mysql",
    logging: false, // Deshabilita logs de SQL en la consola
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión establecida con la base de datos.");
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
    }
};

module.exports = { sequelize, connectDB };
