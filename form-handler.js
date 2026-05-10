// ═══════════════════════════════════════════
// form-handler.js — Country Los Álamos
// Envío de formularios con cola offline
// usando Formspree.io
// ═══════════════════════════════════════════

const FORM_CONTACTO_URL = 'https://formspree.io/f/xzdokrky';
const FORM_RESERVAS_URL = 'https://formspree.io/f/xeenpgpn';

const STORAGE_KEY = 'country_pending_forms';

// ─── Manejo de cola offline ─────────────────
function obtenerPendientes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarPendientes(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

async function enviarPendientes() {
  const pendientes = obtenerPendientes();
  if (pendientes.length === 0) return;

  console.log(`Reintentando enviar ${pendientes.length} formularios pendientes...`);
  let fallidos = [];

  for (const item of pendientes) {
    try {
      await enviarFormulario(item.data, item.url, false);
    } catch (error) {
      fallidos.push(item);
    }
  }

  if (fallidos.length > 0) {
    guardarPendientes(fallidos);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    alert('Todos los mensajes pendientes fueron enviados.');
  }
}

// ─── Envío real a Formspree ────────────────
async function enviarFormulario(data, url, mostrarAlerta = true) {
  const body = new URLSearchParams(data);

  // Añadir _replyto para que Formspree sepa a quién responder
  if (data.email) {
    body.append('_replyto', data.email);
  }

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!respuesta.ok) {
    throw new Error('Error en el envío');
  }
}

// ─── Manejador genérico ────────────────────
function procesarEnvio(data, url, mensajeExito, callbackReset) {
  if (navigator.onLine) {
    enviarFormulario(data, url)
      .then(() => {
        mostrarMensajeCampo(mensajeExito, 'success');
        if (callbackReset) callbackReset();
      })
      .catch(() => {
        // Si falla estando online (servidor caído), guardamos igual
        guardarPendiente(data, url);
        mostrarMensajeCampo('No se pudo enviar. Quedó guardado y se enviará cuando haya conexión.', 'error');
        if (callbackReset) callbackReset();
      });
  } else {
    guardarPendiente(data, url);
    mostrarMensajeCampo('Estás offline. El mensaje se enviará automáticamente al recuperar internet.', 'info');
    if (callbackReset) callbackReset();
  }
}

function guardarPendiente(data, url) {
  const pendientes = obtenerPendientes();
  pendientes.push({ data, url, timestamp: Date.now() });
  guardarPendientes(pendientes);
}

// ─── Manejo visual de mensajes ─────────────
function mostrarMensajeCampo(texto, tipo) {
  // Para el modal de reservas
  const reservaMsg = document.getElementById('reserva-mensaje');
  if (reservaMsg && document.getElementById('modal-reservas')?.classList.contains('activo')) {
    reservaMsg.textContent = texto;
    reservaMsg.className = `reserva-mensaje reserva-${tipo}`;
    reservaMsg.classList.remove('is-hidden');
    return;
  }

  // Para el formulario de contacto
  const contactoMsg = document.getElementById('contacto-mensaje-estado');
  if (contactoMsg) {
    contactoMsg.textContent = texto;
    contactoMsg.style.color = tipo === 'success' ? '#1b5e20' : tipo === 'error' ? '#c0392b' : '#e67e22';
    contactoMsg.style.display = 'block';
  }
}

// ─── Lectura de datos de cada formulario ────
function obtenerDatosContacto() {
  const nombre = document.getElementById('contacto-nombre')?.value.trim();
  const email = document.getElementById('contacto-email')?.value.trim();
  const tel = document.getElementById('contacto-tel')?.value.trim();
  const mensaje = document.getElementById('contacto-mensaje')?.value.trim();

  if (!nombre || !email || !mensaje) {
    throw new Error('Completá nombre, email y mensaje.');
  }

  const motivos = Array.from(document.querySelectorAll('#contacto-motivos .contacto-pill.sel input'))
    .map(input => input.value)
    .join(', ');

  return {
    name: nombre,
    email: email,
    telefono: tel,
    message: mensaje,
    motivos: motivos || 'No especificado'
  };
}

function obtenerDatosReserva() {
  const espacio = document.getElementById('reserva-espacio')?.value;
  const fecha = document.getElementById('reserva-fecha')?.value;
  const horario = document.getElementById('reserva-horario')?.value;
  const personas = document.getElementById('reserva-personas')?.value;

  if (!espacio || !fecha || !horario || !personas) {
    throw new Error('Completá todos los campos de la reserva.');
  }

  // Intentamos obtener el nombre del usuario logueado
  let nombreUsuario = 'Invitado';
  if (typeof Auth !== 'undefined' && Auth.estaLogueado()) {
    const usuario = Auth.obtenerUsuario();
    if (usuario) nombreUsuario = usuario.nombre;
  }

  return {
    name: nombreUsuario,
    email: 'reservas@losalamos.com',  // email genérico, podés cambiarlo
    espacio: espacio,
    fecha: fecha,
    horario: horario,
    personas: personas
  };
}

// ─── Configuración de listeners ────────────
function configurarManejadores() {
  // Contacto
  const btnContacto = document.getElementById('contacto-submit');
  if (btnContacto) {
    btnContacto.addEventListener('click', () => {
      try {
        const datos = obtenerDatosContacto();
        procesarEnvio(datos, FORM_CONTACTO_URL, '¡Mensaje enviado correctamente!', () => {
          document.getElementById('contacto-nombre').value = '';
          document.getElementById('contacto-email').value = '';
          document.getElementById('contacto-tel').value = '';
          document.getElementById('contacto-mensaje').value = '';
          document.querySelectorAll('#contacto-motivos .contacto-pill.sel').forEach(p => p.classList.remove('sel'));
        });
      } catch (e) {
        mostrarMensajeCampo(e.message, 'error');
      }
    });
  }

  // Reservas: reemplazamos el listener que dejó app.js
  const btnReserva = document.getElementById('reserva-submit');
  if (btnReserva) {
    const nuevoBtn = btnReserva.cloneNode(true);
    btnReserva.parentNode.replaceChild(nuevoBtn, btnReserva);

    nuevoBtn.addEventListener('click', () => {
      try {
        const datos = obtenerDatosReserva();
        procesarEnvio(datos, FORM_RESERVAS_URL, '¡Reserva enviada! Te confirmaremos a la brevedad.', () => {
          document.getElementById('reserva-espacio').value = '';
          document.getElementById('reserva-fecha').value = '';
          document.getElementById('reserva-horario').value = '';
          document.getElementById('reserva-personas').value = '';
        });
      } catch (e) {
        mostrarMensajeCampo(e.message, 'error');
      }
    });
  }

  // Al volver la conexión, intentar enviar pendientes
  window.addEventListener('online', () => {
    console.log('Conexión recuperada. Enviando pendientes...');
    enviarPendientes();
  });

  // También al cargar la página si ya hay conexión
  if (navigator.onLine) {
    enviarPendientes();
  }
}

// ─── Arranque ──────────────────────────────
document.addEventListener('DOMContentLoaded', configurarManejadores);
