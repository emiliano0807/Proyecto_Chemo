const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rol = req.headers['rol']; // leer desde encabezado HTTP

    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    next();
  };
};

module.exports = { permitirRoles };
