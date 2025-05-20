const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const { usuario, rol } = req.body;

    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    next();
  };
};

module.exports = { permitirRoles };
