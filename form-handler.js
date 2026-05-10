// ═══════════════════════════════════════════════════
// form-handler.js — Country Los Álamos
// Manejo de formularios con soporte offline
// usando Formspree.io
// ═══════════════════════════════════════════════════

// ---------------------------------------------------
// 1. CONFIGURACIÓN: Endpoints de Formspree
// ---------------------------------------------------
const FORM_CONTACTO_URL = 'https://formspree.io/f/xzdokrky';   // ← endpoint de Contacto
const FORM_RESERVAS_URL = 'https://formspree.io/f/xeenpgpn'; // ← endpoint de Reservas
const FORM_SEGURIDAD_URL = 'https://formspree.io/f/mnjwoegb'; // ← endpoint Seguridad

// Clave que usamos para guardar los formularios pendientes en localStorage
const STORAGE_KEY = 'country_pending_forms';

// ---------------------------------------------------
// 2. MANEJO DE LA COLA OFFLINE
// ---------------------------------------------------

/**
 * Obtiene la lista de formularios pendientes guardados en localStorage.
 * Si hay algún error (ej. datos corruptos), devuelve un array vacío.
 */
function obtenerPendientes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Guarda la lista de formularios pendientes en localStorage.
 * @param {Array} lista - Array de objetos { data, url, timestamp }
 */
function guardarPendientes(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

/**
 * Intenta enviar todos los formularios que quedaron pendientes por falta de conexión.
 * Se ejecuta automáticamente al cargar la página y cuando se recupera la conexión.
 */
async function enviarPendientes() {
  const pendientes = obtenerPendientes();
  if (pendientes.length === 0) return;

  console.log(`Reintentando enviar ${pendientes.length} formularios pendientes...`);
  let fallidos = [];

  for (const item of pendientes) {
    try {
      await enviarFormulario(item.data, item.url);
      // Si se envió bien, no lo agregamos a fallidos (se descarta)
    } catch (error) {
      // Si falla, lo guardamos para reintentar más tarde
      fallidos.push(item);
    }
  }

  if (fallidos.length > 0) {
    guardarPendientes(fallidos);  // quedan para el próximo intento
  } else {
    localStorage.removeItem(STORAGE_KEY);  // todos enviados, limpiamos
    alert('Todos los mensajes pendientes fueron enviados.');
  }
}

// ---------------------------------------------------
// 3. ENVÍO DE FORMULARIOS A FORMSPREE
// ---------------------------------------------------

/**
 * Envía los datos del formulario al endpoint de Formspree usando fetch.
 * @param {Object} data - Objeto con los campos del formulario (name, email, etc.)
 * @param {string} url - Endpoint de Formspree (https://formspree.io/f/...)
 * @throws {Error} Si la respuesta no es exitosa (status !== 200)
 */
async function enviarFormulario(data, url) {
  // Convertimos el objeto a formato application/x-www-form-urlencoded
  const body = new URLSearchParams(data);
  
  // Si el dato incluye un email, lo usamos como _replyto para que Formspree
  // pueda enviar una respuesta automática al usuario
  if (data.email) {
    body.append('_replyto', data.email);
  }

  // Petición POST al endpoint de Formspree
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'    // ← importante para evitar errores CORS
    },
    body: body.toString()
  });

  // Si la respuesta no es OK, intentamos extraer el mensaje de error del JSON
  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en el envío');
  }
}

// ---------------------------------------------------
// 4. MANEJADOR GENÉRICO DE ENVÍO (CON O SIN CONEXIÓN)
// ---------------------------------------------------

/**
 * Procesa el envío de un formulario.
 * Si hay conexión, envía directamente; si no, guarda en la cola offline.
 * @param {Object} data - Datos del formulario
 * @param {string} url - Endpoint de Formspree
 * @param {string} mensajeExito - Texto a mostrar si el envío es exitoso
 * @param {Function} callbackReset - Función que limpia los campos del formulario
 */
function procesarEnvio(data, url, mensajeExito, callbackReset) {
  if (navigator.onLine) {
    // Hay conexión: intentamos enviar directamente
    enviarFormulario(data, url)
      .then(() => {
        mostrarMensajeCampo(mensajeExito, 'success');  // mensaje verde
        if (callbackReset) callbackReset();            // limpiamos campos
      })
      .catch(() => {
        // Si falla (ej. servidor caído), guardamos en cola offline
        guardarPendiente(data, url);
        mostrarMensajeCampo('No se pudo enviar. Se guardó y se enviará al recuperar conexión.', 'error');
        if (callbackReset) callbackReset();
      });
  } else {
    // Estamos offline: guardamos directamente en cola
    guardarPendiente(data, url);
    mostrarMensajeCampo('Estás offline. El mensaje se enviará automáticamente al volver la conexión.', 'info');
    if (callbackReset) callbackReset();
  }
}

/**
 * Agrega un formulario a la cola de pendientes.
 * @param {Object} data - Datos del formulario
 * @param {string} url - Endpoint al que enviarlo cuando haya conexión
 */
function guardarPendiente(data, url) {
  const pendientes = obtenerPendientes();
  pendientes.push({ data, url, timestamp: Date.now() });
  guardarPendientes(pendientes);
}

// ---------------------------------------------------
// 5. VISUALIZACIÓN DE MENSAJES EN LA INTERFAZ
// ---------------------------------------------------

/**
 * Muestra un mensaje de feedback debajo del botón que se presionó.
 * @param {string} texto - Texto a mostrar
 * @param {string} tipo - 'success', 'error' o 'info' (define el color)
 */
function mostrarMensajeCampo(texto, tipo) {
  // Intentamos primero con el modal de reservas (si está abierto)
  const reservaMsg = document.getElementById('reserva-mensaje');
  if (reservaMsg && document.getElementById('modal-reservas')?.classList.contains('activo')) {
    reservaMsg.textContent = texto;
    reservaMsg.className = `reserva-mensaje reserva-${tipo}`; // aplica clase CSS según tipo
    reservaMsg.classList.remove('is-hidden');
    return;
  }

  // Si no, es el formulario de contacto
  const contactoMsg = document.getElementById('contacto-mensaje-estado');
  if (contactoMsg) {
    contactoMsg.textContent = texto;
    contactoMsg.style.color = tipo === 'success' ? '#1b5e20' : tipo === 'error' ? '#c0392b' : '#e67e22';
    contactoMsg.style.display = 'block';
  }
}

// ---------------------------------------------------
// 6. LECTURA DE DATOS DE CADA FORMULARIO
// ---------------------------------------------------

/**
 * Obtiene los datos del formulario de contacto (valida que estén completos).
 * @returns {Object} Datos del formulario
 * @throws {Error} Si falta nombre, email o mensaje
 */
function obtenerDatosContacto() {
  const nombre = document.getElementById('contacto-nombre')?.value.trim();
  const email = document.getElementById('contacto-email')?.value.trim();
  const tel = document.getElementById('contacto-tel')?.value.trim();
  const mensaje = document.getElementById('contacto-mensaje')?.value.trim();

  if (!nombre || !email || !mensaje) {
    throw new Error('Completá nombre, email y mensaje.');
  }

  // Recolectamos los motivos seleccionados (pills que tienen la clase "sel")
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

/**
 * Obtiene los datos del formulario de reservas (valida que estén completos).
 * @returns {Object} Datos de la reserva
 * @throws {Error} Si falta algún campo obligatorio
 */
function obtenerDatosReserva() {
  const espacio = document.getElementById('reserva-espacio')?.value;
  const fecha = document.getElementById('reserva-fecha')?.value;
  const horario = document.getElementById('reserva-horario')?.value;
  const personas = document.getElementById('reserva-personas')?.value;

  if (!espacio || !fecha || !horario || !personas) {
    throw new Error('Completá todos los campos de la reserva.');
  }

  // Obtenemos el nombre del usuario logueado (si hay sesión iniciada)
  let nombreUsuario = 'Invitado';
  if (typeof Auth !== 'undefined' && Auth.estaLogueado()) {
    const usuario = Auth.obtenerUsuario();
    if (usuario) nombreUsuario = usuario.nombre;
  }

  return {
    name: nombreUsuario,
    email: 'reservas@losalamos.com',  // email genérico, puede cambiarse
    espacio: espacio,
    fecha: fecha,
    horario: horario,
    personas: personas
  };
}

// ---------------------------------------------------
// 7. CONFIGURACIÓN DE EVENTOS (LISTENERS)
// ---------------------------------------------------

function configurarManejadores() {
  // ─── Formulario de CONTACTO ─────────────────
  const btnContacto = document.getElementById('contacto-submit');
  if (btnContacto) {
    btnContacto.addEventListener('click', () => {
      try {
        const datos = obtenerDatosContacto();
        procesarEnvio(datos, FORM_CONTACTO_URL, '¡Mensaje enviado correctamente!', () => {
          // Callback: limpia los campos después de un envío exitoso
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

  // ─── Formulario de RESERVAS ─────────────────
  const btnReserva = document.getElementById('reserva-submit');
  if (btnReserva) {
    // Clonamos el botón para eliminar cualquier listener anterior que pudiera interferir
    const nuevoBtn = btnReserva.cloneNode(true);
    btnReserva.parentNode.replaceChild(nuevoBtn, btnReserva);

    nuevoBtn.addEventListener('click', () => {
      try {
        const datos = obtenerDatosReserva();
        procesarEnvio(datos, FORM_RESERVAS_URL, '¡Reserva enviada! Te confirmaremos a la brevedad.', () => {
          // Callback: limpia los campos después de un envío exitoso
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

    /**
 * Obtiene los datos del formulario de seguridad (valida que estén completos).
 * @returns {Object} Datos de la autorización
 * @throws {Error} Si falta nombre, horario o cantidad de personas
 */
function obtenerDatosSeguridad() {
  const nombre = document.getElementById('seg-nombre')?.value.trim();
  const horario = document.getElementById('seg-horario')?.value;
  const personas = document.getElementById('seg-personas')?.value;

  if (!nombre || !horario || !personas) {
    throw new Error('Completá todos los campos.');
  }

  // Obtenemos el nombre del usuario logueado (si hay sesión iniciada)
  let nombreUsuario = 'Invitado';
  if (typeof Auth !== 'undefined' && Auth.estaLogueado()) {
    const usuario = Auth.obtenerUsuario();
    if (usuario) nombreUsuario = usuario.nombre;
  }

  return {
    name: nombreUsuario,
    email: 'seguridad@losalamos.com',  // email genérico identificatorio
    visitante: nombre,
    horario: horario,
    personas: personas
  };
}

  // ─── Evento: cuando el dispositivo recupera la conexión ────
  window.addEventListener('online', () => {
    console.log('Conexión recuperada. Enviando pendientes...');
    enviarPendientes();
  });

  // ─── Al cargar la página, si ya hay conexión, intentamos enviar pendientes ────
  if (navigator.onLine) {
    enviarPendientes();
  }
}

// ─────────────────────────────────────────────────
// 8. ARRANQUE: cuando el DOM está listo, configuramos todo
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', configurarManejadores);
