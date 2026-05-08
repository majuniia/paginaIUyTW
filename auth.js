const Auth = (() => {
  const STORAGE_KEY = 'country_auth_user';
  const usuarios = [
    {
      usuario: 'residente',
      password: 'losalamos2024',
      nombre: 'Residente',
    },
  ];

  function validarCredenciales(usuario, password) {
    const usuarioNormalizado = usuario.trim().toLowerCase();

    return usuarios.find((cuenta) => (
      cuenta.usuario === usuarioNormalizado && cuenta.password === password
    ));
  }

  function iniciarSesion(usuario, password) {
    if (!usuario.trim() || !password.trim()) {
      return {
        ok: false,
        mensaje: 'Completá usuario y contraseña.',
      };
    }

    const cuenta = validarCredenciales(usuario, password);

    if (!cuenta) {
      return {
        ok: false,
        mensaje: 'Usuario o contraseña incorrectos.',
      };
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      usuario: cuenta.usuario,
      nombre: cuenta.nombre,
    }));

    return {
      ok: true,
      usuario: cuenta,
    };
  }

  function cerrarSesion() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function estaLogueado() {
    return Boolean(obtenerUsuario());
  }

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

  return {
    iniciarSesion,
    cerrarSesion,
    estaLogueado,
    obtenerUsuario,
  };
})();
