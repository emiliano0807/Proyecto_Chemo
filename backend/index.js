const express = require("express");
const cors = require("cors");
const { sequelize, connectDB } = require("./data/source");
const productoRoutes = require("./routes/productoRoutes");
const notaRemisionRoutes = require("./routes/notaRemisionRoutes");
const authRoutes = require("./routes/authRoutes"); // 👈 Ruta de autenticación



const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/productos", productoRoutes);
app.use("/api/nota_remision", notaRemisionRoutes);
app.use("/api", authRoutes); // 👈 Ruta de autenticación

// 🌱 Función para insertar productos iniciales si no existen
const insertarProductosIniciales = async () => {
    const [result] = await sequelize.query("SELECT COUNT(*) AS total FROM productos");
    const total = result[0].total;

    if (total === 0) {
        console.log("🌱 Insertando productos iniciales...");
        await sequelize.query(`
            INSERT INTO productos (nombre, descripcion, precio, stock_actual, stock_minimo, stock_maximo)
            VALUES 
                ('Playera Básica', 'Playera de algodón unisex', 149.99, 50, 10, 100),
                ('Jeans Slim', 'Jeans azul ajustado', 399.50, 30, 5, 60),
                ('Sudadera Negra', 'Sudadera con gorro talla M', 549.00, 20, 5, 40),
                ('Zapatos Casual', 'Zapatos de cuero negro', 699.99, 15, 3, 30),
                ('Blusa Estampada', 'Blusa para dama con flores', 299.00, 25, 5, 50);
        `);
        console.log("✅ Productos iniciales insertados.");
    }
};

// Iniciar el servidor y conectar a la base de datos
const startServer = async () => {
    try {
        await connectDB();
        await sequelize.sync();
        await insertarProductosIniciales(); // 👈 Aquí se insertan si es necesario

        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
    }
};

startServer();
