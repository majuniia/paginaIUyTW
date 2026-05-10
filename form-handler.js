// ═══════════════════════════════════════════════════
// form-handler.js — Country Los Álamos
// Manejo de formularios (Contacto, Reservas, Seguridad)
// con soporte offline usando Formspree.io
// ═══════════════════════════════════════════════════

// ---------------------------------------------------
// 1. CONFIGURACIÓN: Endpoints de Formspree
// ---------------------------------------------------
const FORM_CONTACTO_URL = 'https://formspree.io/f/xzdokrky';   // Contacto
const FORM_RESERVAS_URL = 'https://formspree.io/f/xeenpgpn';   // Reservas
const FORM_SEGURIDAD_URL = 'https://formspree.io/f/mnjwoegb';  // Seguridad

const STORAGE_KEY = 'country_pending_forms';

// ---------------------------------------------------
// 2. MANEJO DE LA COLA OFFLINE
// ---------------------------------------------------

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
      await enviarFormulario(item.data, item.url);
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

// ---------------------------------------------------
// 3. ENVÍO DE FORMULARIOS A FORMSPREE
// ---------------------------------------------------

async function enviarFormulario(data, url) {
  const body = new URLSearchParams(data);
  if (data.email) {
    body.append('_replyto', data.email);
  }

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: body.toString()
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en el envío');
  }
}

// ---------------------------------------------------
// 4. MANEJADOR GENÉRICO DE ENVÍO (CON O SIN CONEXIÓN)
// ---------------------------------------------------

function procesarEnvio(data, url, mensajeExito, callbackReset) {
  if (navigator.onLine) {
    enviarFormulario(data, url)
      .then(() => {
        mostrarMensajeCampo(mensajeExito, 'success');
        if (callbackReset) callbackReset();
      })
      .catch(() => {
        guardarPendiente(data, url);
        mostrarMensajeCampo('No se pudo enviar. Se guardó y se enviará al recuperar conexión.', 'error');
        if (callbackReset) callbackReset();
      });
  } else {
    guardarPendiente(data, url);
    mostrarMensajeCampo('Estás offline. El mensaje se enviará automáticamente al volver la conexión.', 'info');
    if (callbackReset) callbackReset();
  }
}

function guardarPendiente(data, url) {
  const pendientes = obtenerPendientes();
  pendientes.push({ data, url, timestamp: Date.now() });
  guardarPendientes(pendientes);
}

// ---------------------------------------------------
// 5. VISUALIZACIÓN DE MENSAJES EN LA INTERFAZ
// ---------------------------------------------------

function mostrarMensajeCampo(texto, tipo) {
  // Modal de reservas
  const reservaMsg = document.getElementById('reserva-mensaje');
  if (reservaMsg && document.getElementById('modal-reservas')?.classList.contains('activo')) {
    reservaMsg.textContent = texto;
    reservaMsg.className = `reserva-mensaje reserva-${tipo}`;
    reservaMsg.classList.remove('is-hidden');
    return;
  }

  // Modal de seguridad
  const segMsg = document.getElementById('seg-mensaje');
  if (segMsg && document.getElementById('modal-seguridad')?.classList.contains('activo')) {
    segMsg.textContent = texto;
    segMsg.className = `reserva-mensaje reserva-${tipo}`;
    segMsg.classList.remove('is-hidden');
    return;
  }

  // Formulario de contacto
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

  let nombreUsuario = 'Invitado';
  if (typeof Auth !== 'undefined' && Auth.estaLogueado()) {
    const usuario = Auth.obtenerUsuario();
    if (usuario) nombreUsuario = usuario.nombre;
  }

  return {
    name: nombreUsuario,
    email: 'reservas@losalamos.com',
    espacio: espacio,
    fecha: fecha,
    horario: horario,
    personas: personas
  };
}

function obtenerDatosSeguridad() {
  const nombre = document.getElementById('seg-nombre')?.value.trim();
  const horario = document.getElementById('seg-horario')?.value;
  const personas = document.getElementById('seg-personas')?.value;

  if (!nombre || !horario || !personas) {
    throw new Error('Completá todos los campos.');
  }

  let nombreUsuario = 'Invitado';
  if (typeof Auth !== 'undefined' && Auth.estaLogueado()) {
    const usuario = Auth.obtenerUsuario();
    if (usuario) nombreUsuario = usuario.nombre;
  }

  return {
    name: nombreUsuario,
    email: 'seguridad@losalamos.com',
    visitante: nombre,
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

  // ─── Formulario de SEGURIDAD ─────────────────
  const btnSeguridad = document.getElementById('seg-submit');
  if (btnSeguridad) {
    const nuevoBtnSeg = btnSeguridad.cloneNode(true);
    btnSeguridad.parentNode.replaceChild(nuevoBtnSeg, btnSeguridad);

    nuevoBtnSeg.addEventListener('click', () => {
      try {
        const datos = obtenerDatosSeguridad();
        procesarEnvio(datos, FORM_SEGURIDAD_URL, '¡Visita autorizada! Seguridad fue notificado.', () => {
          // Limpiar campos
          document.getElementById('seg-nombre').value = '';
          document.getElementById('seg-horario').value = '';
          document.getElementById('seg-personas').value = '';

          // Agregar tarjeta visual
          const lista = document.getElementById('seg-visita-lista');
          if (lista) {
            if (lista.querySelector('p')) lista.innerHTML = '';

            const initials = datos.visitante
              .split(' ')
              .map(n => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const item = document.createElement('div');
            item.className = 'visita-card';

            const avatar = document.createElement('div');
            avatar.className = 'visita-avatar';
            avatar.textContent = initials;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'visita-info';

            const nombreP = document.createElement('p');
            nombreP.className = 'visita-nombre';
            nombreP.textContent = datos.visitante;

            const detalleP = document.createElement('p');
            detalleP.className = 'visita-detalle';
            detalleP.textContent = `Hoy · ${datos.horario} · ${datos.personas} persona${datos.personas > 1 ? 's' : ''}`;

            infoDiv.appendChild(nombreP);
            infoDiv.appendChild(detalleP);

            const badge = document.createElement('span');
            badge.className = 'visita-badge';
            badge.textContent = 'Confirmada';

            item.appendChild(avatar);
            item.appendChild(infoDiv);
            item.appendChild(badge);

            lista.prepend(item);
          }
        });
      } catch (e) {
        mostrarMensajeCampo(e.message, 'error');
      }
    });
  }

  // ─── Eventos de conexión ─────────────────
  window.addEventListener('online', () => {
    console.log('Conexión recuperada. Enviando pendientes...');
    enviarPendientes();
  });

  if (navigator.onLine) {
    enviarPendientes();
  }
}

// ─────────────────────────────────────────────────
// 8. ARRANQUE: cuando el DOM está listo, configuramos todo
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', configurarManejadores);
