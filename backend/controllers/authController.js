const authService = require("../services/authServices");

const login = (req, res) => {
  const { usuario, contrasena } = req.body;

  const encontrado = authService.autenticar(usuario, contrasena);
  if (!encontrado) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

  res.json({ usuario: encontrado.usuario, rol: encontrado.rol });
};

module.exports = { login };
