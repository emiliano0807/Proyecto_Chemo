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

router.get("/",permitirRoles("cliente"), obtenerProductosController);
router.get("/:id",permitirRoles("cliente"), obtenerProductoPorIdController);
router.post("/", permitirRoles("admin"), crearProductoController);
router.put("/:id",permitirRoles("admin"), actualizarProductoController);
router.delete("/:id",permitirRoles("admin"), eliminarProductoController);

module.exports = router;

