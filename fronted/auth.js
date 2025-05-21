// Datos de usuarios (simulados)
const usuarios = [
    { id: 1, usuario: 'admin', contrasena: 'admin123', nombre: 'Administrador', rol: 'admin' },
    { id: 2, usuario: 'empleado', contrasena: 'empleado123', nombre: 'Empleado Ejemplo', rol: 'empleado' }
];

// Función para autenticar usuario
function autenticarUsuario(usuario, contrasena) {
    const usuarioEncontrado = usuarios.find(u => 
        u.usuario === usuario && u.contrasena === contrasena
    );
    
    if(usuarioEncontrado) {
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
        localStorage.setItem('loggedIn', 'true');
        return true;
    }
    return false;
}

// Función para verificar si el usuario está autenticado
function estaAutenticado() {
    return localStorage.getItem('loggedIn') === 'true';
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuarioActual');
    return usuario ? JSON.parse(usuario) : null;
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('loggedIn');
}

// Exportar funciones para usar en otros archivos
if(typeof module !== 'undefined' && module.exports) {
    module.exports = {
        autenticarUsuario,
        estaAutenticado,
        obtenerUsuarioActual,
        cerrarSesion
    };
}