const usuarios = [
  { usuario: "admin", contrasena: "admin123", rol: "admin" },
  { usuario: "cliente", contrasena: "cliente123", rol: "cliente" }
];

const autenticar = (usuario, contrasena) => {
  return usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);
};

module.exports = { autenticar };
