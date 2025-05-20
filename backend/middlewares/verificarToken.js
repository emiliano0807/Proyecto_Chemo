const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
    req.usuario = decoded.usuario;
    req.rol = decoded.rol;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};

module.exports = { verificarToken };
