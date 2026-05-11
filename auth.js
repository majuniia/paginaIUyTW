// ============================
// auth.js — Country Los Álamos
// Módulo de autenticación de residentes
// ============================

// IIFE: módulo privado que expone solo los métodos públicos al objeto Auth.
const Auth = (() => {
  // Clave de sessionStorage donde se guarda la sesión (se borra al cerrar la pestaña).
  const STORAGE_KEY = 'country_auth_user';

  // Lista de usuarios autorizados (en producción iría en un backend).
  const usuarios = [
    {
      usuario: 'residente',
      password: 'losalamos2024',
      nombre: 'Residente',
    },
  ];

  /**
   * Busca si las credenciales coinciden con algún usuario de la lista.
   * @returns {Object|undefined} El objeto usuario si coincide, o undefined.
   */
  function validarCredenciales(usuario, password) {
    const usuarioNormalizado = usuario.trim().toLowerCase();
    return usuarios.find((cuenta) => (
      cuenta.usuario === usuarioNormalizado && cuenta.password === password
    ));
  }

  /**
   * Inicia sesión si las credenciales son correctas.
   * Guarda los datos del usuario en sessionStorage.
   * @returns {{ ok: boolean, mensaje?: string, usuario?: Object }}
   */
  function iniciarSesion(usuario, password) {
    if (!usuario.trim() || !password.trim()) {
      return { ok: false, mensaje: 'Completá usuario y contraseña.' };
    }

    const cuenta = validarCredenciales(usuario, password);

    if (!cuenta) {
      return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      usuario: cuenta.usuario,
      nombre: cuenta.nombre,
    }));

    return { ok: true, usuario: cuenta };
  }

  /** Cierra la sesión eliminando los datos de sessionStorage. */
  function cerrarSesion() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /** @returns {boolean} true si hay una sesión activa. */
  function estaLogueado() {
    return Boolean(obtenerUsuario());
  }

  /**
   * Recupera los datos del usuario logueado desde sessionStorage.
   * @returns {Object|null} El objeto usuario o null si no hay sesión.
   */
  function obtenerUsuario() {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      cerrarSesion();
      return null;
    }
  }

  // Métodos públicos del módulo Auth
  return { iniciarSesion, cerrarSesion, estaLogueado, obtenerUsuario };
})();
