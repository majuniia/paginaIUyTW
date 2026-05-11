// ============================
// app.js — Country Los Álamos
// Lógica principal de la interfaz:
// slider, modales, lightbox, login,
// menú móvil, animaciones y manejo
// visual de formularios.
// ============================

// -----------------------------------------------
// 1. DATOS DE IMÁGENES
// -----------------------------------------------

// Imágenes de la galería acordeón
const galleryImages = [
  './icons/Fondos/galeria-1.jpg',
  './icons/Fondos/galeria-2.jpg',
  './icons/Fondos/galeria-3.jpg',
  './icons/Fondos/galeria-4.jpg',
  './icons/Fondos/galeria-5.jpg',
  './icons/Fondos/galeria-6.jpg',
  './icons/Fondos/galeria-7.jpg',
  './icons/Fondos/galeria-8.jpg',
];

// Imágenes dentro de cada modal de amenity
const modalImageGroups = {
  pileta: ['./icons/Fondos/pileta-1.jpg', './icons/Fondos/pileta-2.jpg', './icons/Fondos/pileta-3.jpg'],
  tenis: ['./icons/Fondos/tenis-1.jpg', './icons/Fondos/tenis-2.jpg', './icons/Fondos/tenis-3.jpg'],
  nauticos: ['./icons/Fondos/nauticos-1.jpg', './icons/Fondos/nauticos-2.jpg', './icons/Fondos/nauticos-3.jpg', './icons/Fondos/nauticos-4.jpg'],
  futbol: ['./icons/Fondos/futbol-1.jpg', './icons/Fondos/futbol-2.jpg', './icons/Fondos/futbol-3.jpg'],
  gimnasio: ['./icons/Fondos/gimnasio-1.jpg', './icons/Fondos/gimnasio-2.jpg', './icons/Fondos/gimnasio-3.jpg'],
  verdes: ['./icons/Fondos/verdes-1.jpg', './icons/Fondos/verdes-2.jpg', './icons/Fondos/verdes-3.jpg'],
  clubhouse: ['./icons/Fondos/clubhouse-1.jpg', './icons/Fondos/clubhouse-2.jpg', './icons/Fondos/clubhouse-3.jpg'],
  ciclovias: ['./icons/Fondos/ciclovias-1.jpg', './icons/Fondos/ciclovias-2.jpg'],
};

// Variables de estado del slider y lightbox
let currentSlide = 0;
let lightboxImagenes = [];
let lightboxIndex = 0;

// -----------------------------------------------
// 2. SLIDER
// -----------------------------------------------

/**
 * Muestra una slide específica del slider.
 * @param {number} index - Índice de la slide a mostrar.
 */
function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}

// -----------------------------------------------
// 3. MODALES
// -----------------------------------------------

/** Abre el modal con el ID indicado. */
function abrirModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.add('activo');
  document.body.style.overflow = 'hidden';
}

/** Cierra el modal con el ID indicado. */
function cerrarModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.remove('activo');
  document.body.style.overflow = '';
}

// -----------------------------------------------
// 4. LIGHTBOX (visor de imágenes)
// -----------------------------------------------

/** Abre el lightbox con las imágenes del grupo y el índice seleccionado. */
function abrirLightbox(imagenes, index) {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-contador');
  if (!lightbox || !image || !counter) return;
  lightboxImagenes = imagenes;
  lightboxIndex = index;
  image.src = imagenes[index];
  counter.textContent = (index + 1) + ' / ' + imagenes.length;
  lightbox.classList.add('activo');
}

/** Cierra el lightbox. */
function cerrarLightbox() {
  document.getElementById('lightbox')?.classList.remove('activo');
}

/** Navega entre las imágenes del lightbox. */
function cambiarLightbox(direccion) {
  if (!lightboxImagenes.length) return;
  lightboxIndex = (lightboxIndex + direccion + lightboxImagenes.length) % lightboxImagenes.length;
  document.getElementById('lightbox-img').src = lightboxImagenes[lightboxIndex];
  document.getElementById('lightbox-contador').textContent = (lightboxIndex + 1) + ' / ' + lightboxImagenes.length;
}

// -----------------------------------------------
// 5. FORMULARIO DE RESERVA (solo visual)
//    El envío real está en form-handler.js
// -----------------------------------------------

/** Maneja la interfaz del formulario de reserva. */
function enviarReserva() {
  const espacio = document.getElementById('reserva-espacio').value;
  const fecha = document.getElementById('reserva-fecha').value;
  const horario = document.getElementById('reserva-horario').value;
  const personas = document.getElementById('reserva-personas').value;
  const mensaje = document.getElementById('reserva-mensaje');

  mensaje.classList.remove('is-hidden', 'reserva-error', 'reserva-exito');

  if (!espacio || !fecha || !horario || !personas) {
    mensaje.classList.add('reserva-error');
    mensaje.textContent = 'Por favor completá todos los campos.';
    return;
  }

  mensaje.classList.add('reserva-exito');
  mensaje.innerHTML = '<i class="fa-solid fa-check-circle"></i> ¡Reserva enviada! Recibirás confirmación por WhatsApp.';

  setTimeout(() => {
    cerrarModal('reservas');
    mensaje.classList.add('is-hidden');
    document.getElementById('reserva-espacio').value = '';
    document.getElementById('reserva-fecha').value = '';
    document.getElementById('reserva-horario').value = '';
    document.getElementById('reserva-personas').value = '';
  }, 3000);
}

// -----------------------------------------------
// 6. LOGIN
// -----------------------------------------------

/** Abre o cierra el login según el estado de sesión. */
function toggleLogin() {
  if (Auth.estaLogueado()) {
    cerrarSesion();
    return;
  }
  document.getElementById('login-overlay')?.classList.add('activo');
}

/** Cierra el modal de login. */
function cerrarLogin() {
  document.getElementById('login-overlay')?.classList.remove('activo');
}

/** Toma los datos del formulario de login y autentica al usuario. */
function iniciarSesion() {
  const usuario = document.getElementById('login-usuario').value;
  const password = document.getElementById('login-password').value;
  const error = document.getElementById('login-error');
  const resultado = Auth.iniciarSesion(usuario, password);

  if (resultado.ok) {
    error.style.display = 'none';
    cerrarLogin();
    document.getElementById('login-usuario').value = '';
    document.getElementById('login-password').value = '';
    actualizarEstadoLogin();
    return;
  }

  error.textContent = resultado.mensaje;
  error.style.display = 'block';
}

/** Cierra la sesión del usuario. */
function cerrarSesion() {
  Auth.cerrarSesion();
  actualizarEstadoLogin();
}

/** Actualiza la interfaz según el estado de login. */
function actualizarEstadoLogin() {
  const logueado = Auth.estaLogueado();
  const btn = document.getElementById('header-login-btn');
  if (!btn) return;

  btn.innerHTML = logueado
    ? '<i class="fa-solid fa-user"></i> Cerrar sesión'
    : '<i class="fa-solid fa-user"></i> Ingresar';
  btn.classList.toggle('logueado', logueado);

  if (logueado) {
    desbloquearCards();
  } else {
    bloquearCards();
  }
}

// -----------------------------------------------
// 7. BLOQUEO / DESBLOQUEO DE CARDS
// -----------------------------------------------

/** Muestra la información privada de las cards (expensas, reservas, seguridad). */
function desbloquearCards() {
  document.querySelectorAll('.card-bloqueada').forEach((card) => {
    card.classList.add('card-desbloqueada');
  });
  document.querySelectorAll('.monto-privado').forEach((monto) => {
    monto.textContent = monto.dataset.monto || monto.textContent;
    monto.classList.remove('monto-privado');
  });
  document.querySelectorAll('.card-overlay').forEach((overlay) => {
    overlay.style.display = 'none';
  });
  document.querySelectorAll('.card-contenido-blur').forEach((contenido) => {
    contenido.style.display = '';
    contenido.style.filter = 'none';
    contenido.style.opacity = '1';
    contenido.style.pointerEvents = 'auto';
  });
  document.getElementById('card-reservas-logueado')?.classList.remove('is-hidden');
  document.getElementById('card-seguridad-logueado')?.classList.remove('is-hidden');
}

/** Oculta la información privada detrás de un overlay borroso. */
function bloquearCards() {
  document.querySelectorAll('.card-bloqueada').forEach((card) => {
    card.classList.remove('card-desbloqueada');
  });
  document.querySelectorAll('.monto[data-monto]').forEach((monto) => {
    monto.textContent = '$ •••••';
    monto.classList.add('monto-privado');
  });
  document.querySelectorAll('.card-overlay').forEach((overlay) => {
    overlay.style.display = 'flex';
  });
  document.querySelectorAll('.card-contenido-blur').forEach((contenido) => {
    contenido.style.display = '';
    contenido.style.filter = 'blur(3px)';
    contenido.style.opacity = '0.5';
  });
  document.getElementById('card-reservas-logueado')?.classList.add('is-hidden');
  document.getElementById('card-seguridad-logueado')?.classList.add('is-hidden');
}

// -----------------------------------------------
// 8. CONFIGURACIÓN DE EVENTOS
// -----------------------------------------------

/** Asigna todos los listeners de la interfaz. */
function configurarEventos() {
  // Controles del slider
  document.getElementById('next')?.addEventListener('click', () => showSlide(currentSlide + 1));
  document.getElementById('prev')?.addEventListener('click', () => showSlide(currentSlide - 1));
  setInterval(() => showSlide(currentSlide + 1), 6000);

  // Login
  document.getElementById('header-login-btn')?.addEventListener('click', toggleLogin);
  document.getElementById('login-close')?.addEventListener('click', cerrarLogin);
  document.getElementById('login-submit')?.addEventListener('click', iniciarSesion);
  document.querySelectorAll('.js-login-trigger').forEach((button) => button.addEventListener('click', toggleLogin));

  // Cerrar login al hacer clic fuera
  document.getElementById('login-overlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'login-overlay') cerrarLogin();
  });

  // Modales de amenities
  document.querySelectorAll('[data-modal-target]').forEach((element) => {
    element.addEventListener('click', () => abrirModal(element.dataset.modalTarget));
  });
  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => cerrarModal(button.dataset.closeModal));
  });

  // Cerrar modales al hacer clic fuera del contenido
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (event) => {
      if (event.target !== overlay) return;
      cerrarModal(overlay.id.replace('modal-', ''));
    });
  });

  // Galería acordeón
  document.querySelectorAll('[data-lightbox-group="galeria"]').forEach((image) => {
    image.addEventListener('click', () => abrirLightbox(galleryImages, Number(image.dataset.lightboxIndex)));
  });

  // Imágenes dentro de los modales
  Object.entries(modalImageGroups).forEach(([modalId, rutas]) => {
    document.querySelectorAll('#modal-' + modalId + ' .modal-imagenes img').forEach((img, index) => {
      img.addEventListener('click', (event) => {
        event.stopPropagation();
        abrirLightbox(rutas, index);
      });
    });
  });

  // Lightbox
  document.getElementById('lightbox')?.addEventListener('click', (event) => {
    if (event.target.id === 'lightbox') cerrarLightbox();
  });
  document.getElementById('lightbox-close')?.addEventListener('click', cerrarLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => cambiarLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => cambiarLightbox(1));

  // Reserva (manejo visual, el envío real está en form-handler.js)
  document.getElementById('reserva-submit')?.addEventListener('click', enviarReserva);

  // Evitar fechas pasadas en el input de fecha
  const inputFecha = document.getElementById('reserva-fecha');
  if (inputFecha) inputFecha.min = new Date().toISOString().split('T')[0];

  // Menú hamburguesa móvil
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav-secundaria-menu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav-abierta');
      const abierto = nav.classList.contains('nav-abierta');
      toggle.innerHTML = abierto ? '✕' : '&#9776;';
      toggle.setAttribute('aria-expanded', String(abierto));
      toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-abierta');
        toggle.innerHTML = '&#9776;';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  // Atajos de teclado
  document.addEventListener('keydown', (event) => {
    // Enter en login
    if (event.key === 'Enter' && document.getElementById('login-overlay')?.classList.contains('activo')) {
      iniciarSesion();
    }
    // Flechas en lightbox
    if (document.getElementById('lightbox')?.classList.contains('activo')) {
      if (event.key === 'ArrowRight') cambiarLightbox(1);
      if (event.key === 'ArrowLeft') cambiarLightbox(-1);
      if (event.key === 'Escape') cerrarLightbox();
    }
    // Escape cierra cualquier modal abierto
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.activo').forEach((modal) => {
        modal.classList.remove('activo');
      });
      document.body.style.overflow = '';
    }
  });

  // Galería acordeón
  const galeriaToggle = document.getElementById('galeria-toggle');
  const galeriaContenido = document.getElementById('galeria-contenido');
  if (galeriaToggle && galeriaContenido) {
    galeriaToggle.addEventListener('click', () => {
      const abierto = galeriaContenido.classList.toggle('abierto');
      galeriaToggle.setAttribute('aria-expanded', String(abierto));
    });
  }

  // Tabs del modal de seguridad
  document.querySelectorAll('.seg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.seg-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.seg-panel').forEach(p => p.classList.add('is-hidden'));
      tab.classList.add('active');
      document.getElementById('seg-panel-' + tab.dataset.tab).classList.remove('is-hidden');
    });
  });

  // Confirmar visita en seguridad (manejo visual)
  document.getElementById('seg-submit')?.addEventListener('click', () => {
    const nombre = document.getElementById('seg-nombre').value.trim();
    const horario = document.getElementById('seg-horario').value;
    const personas = document.getElementById('seg-personas').value;
    const mensaje = document.getElementById('seg-mensaje');

    mensaje.classList.remove('is-hidden', 'reserva-error', 'reserva-exito');
    mensaje.style.display = '';

    if (!nombre || !horario || !personas) {
      mensaje.classList.add('reserva-error');
      mensaje.textContent = 'Completá todos los campos.';
      mensaje.style.display = 'block';
      return;
    }

    const lista = document.getElementById('seg-visita-lista');
    if (lista.querySelector('p')) lista.innerHTML = '';
    const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f9fafb;border:0.5px solid #dce3ee;border-radius:8px;margin-bottom:8px;';
    item.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:#e8eef7;display:flex;align-items:center;justify-content:center;color:#003366;font-size:12px;font-weight:700;flex-shrink:0;">${initials}</div>
      <div style="flex:1;">
        <p style="font-size:13px;font-weight:500;color:#0D1B2A;margin:0 0 2px;">${nombre}</p>
        <p style="font-size:11px;color:#9CA3AF;margin:0;">Hoy · ${horario} · ${personas} persona${personas > 1 ? 's' : ''}</p>
      </div>
      <span style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px;background:#e6f4ea;color:#1b5e20;">Confirmada</span>`;
    lista.prepend(item);

    mensaje.classList.add('reserva-exito');
    mensaje.innerHTML = '<i class="fa-solid fa-check-circle"></i> ¡Visita autorizada! Seguridad fue notificado.';
    mensaje.style.display = 'block';

    document.getElementById('seg-nombre').value = '';
    document.getElementById('seg-horario').value = '';
    document.getElementById('seg-personas').value = '';

    setTimeout(() => {
      mensaje.classList.add('is-hidden');
      mensaje.style.display = '';
    }, 4000);
  });
}

// Cargar eventos desde la API
fetch('https://country-api-buu5.onrender.com/eventos')
  .then(res => res.json())
  .then(data => {
    const lista = document.querySelector('.eventos-lista');
    if (!lista || !data.eventos) return;

    lista.innerHTML = '';
    data.eventos.forEach(evento => {
      const badgeClass = evento.categoria === 'Aviso'
        ? 'evento-badge evento-badge-aviso'
        : evento.categoria === 'Comunidad'
        ? 'evento-badge evento-badge-comunidad'
        : 'evento-badge';

      lista.innerHTML += `
        <div class="evento-item">
          <div class="evento-fecha">
            <span class="evento-dia">${evento.dia}</span>
            <span class="evento-mes">${evento.mes}</span>
          </div>
          <div class="evento-info">
            <h4>${evento.titulo}</h4>
            <p>${evento.descripcion}</p>
          </div>
          <span class="${badgeClass}">${evento.categoria}</span>
        </div>`;
    });

    // Guardar en localStorage para uso offline
    localStorage.setItem('eventos_cache', JSON.stringify(data.eventos));
  })
  .catch(() => {
    // Sin conexión: cargar desde caché
    const cache = localStorage.getItem('eventos_cache');
    if (cache) {
      const lista = document.querySelector('.eventos-lista');
      if (!lista) return;
      lista.innerHTML = '';
      JSON.parse(cache).forEach(evento => {
        lista.innerHTML += `
          <div class="evento-item">
            <div class="evento-fecha">
              <span class="evento-dia">${evento.dia}</span>
              <span class="evento-mes">${evento.mes}</span>
            </div>
            <div class="evento-info">
              <h4>${evento.titulo}</h4>
              <p>${evento.descripcion}</p>
            </div>
            <span class="evento-badge">${evento.categoria}</span>
          </div>`;
      });
    }
  });

// -----------------------------------------------
// 9. ANIMACIONES AL HACER SCROLL
// -----------------------------------------------

/** Agrega la clase 'reveal-on-scroll' a los elementos seleccionados y los observa. */
function configurarAnimacionesScroll() {
  const elementos = document.querySelectorAll(`
    .dashboard,
    #noticias,
    .galeria,
    .historia,
    .numeros,
    .amenities,
    #acceso,
    #convivencia,
    footer,
    .card,
    .evento-item,
    .amenity-item,
    .galeria-grid img
  `);

  elementos.forEach((elemento) => elemento.classList.add('reveal-on-scroll'));

  // Si el navegador no soporta IntersectionObserver, mostramos todo de inmediato.
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((elemento) => elemento.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  elementos.forEach((elemento, index) => {
    elemento.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
    observer.observe(elemento);
  });
}

// -----------------------------------------------
// 10. ARRANQUE AL CARGAR LA PÁGINA
// -----------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  configurarAnimacionesScroll();
  configurarEventos();
  actualizarEstadoLogin();

  // Cierra el menú móvil al hacer scroll
  window.addEventListener('scroll', function () {
    const nav = document.getElementById('nav-secundaria-menu');
    const toggle = document.getElementById('menuToggle');
    if (nav && nav.classList.contains('nav-abierta')) {
      nav.classList.remove('nav-abierta');
      toggle.innerHTML = '&#9776;';
      toggle.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });

  // Pills del formulario de contacto (toggle de selección)
  document.querySelectorAll('.contacto-pill').forEach(pill => {
    pill.addEventListener('click', () => pill.classList.toggle('sel'));
  });
});
