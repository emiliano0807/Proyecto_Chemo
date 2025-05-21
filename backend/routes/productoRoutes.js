const express = require("express");
const router = express.Router();
const {
    crearProductoController,
    obtenerProductosController,
    obtenerProductoPorIdController,
    actualizarProductoController,
    eliminarProductoController
} = require("../controllers/productoController");
const { permitirRoles } = require("../middlewares/authMiddleware");

router.get("/", obtenerProductosController);
router.get("/:id", obtenerProductoPorIdController);
router.post("/", crearProductoController);
router.put("/:id", actualizarProductoController);
router.delete("/:id", eliminarProductoController);

module.exports = router;

