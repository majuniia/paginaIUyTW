// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registrado'))
      .catch(err => console.log('Error:', err));
  });
}

// URL de la función serverless
const API_URL = 'https://country-api-buu5.onrender.com';

// Función para mostrar los datos en pantalla
function mostrarDatos(datos) {
  const listaAvisos = document.getElementById('lista-avisos');
  if (listaAvisos) {
    listaAvisos.innerHTML = '';
    datos.avisos.forEach(aviso => {
      const item = document.createElement('li');
      item.textContent = aviso;
      listaAvisos.appendChild(item);
    });
  }

  const estadoExpensas = document.getElementById('estado-expensas');
  if (estadoExpensas) {
    estadoExpensas.textContent = `Estado: ${datos.expensas.estado} | Monto: $${datos.expensas.monto} | Vencimiento: ${datos.expensas.vencimiento}`;
  }
}

// Función principal para cargar datos
async function cargarDatos() {
  try {
    // Intentar obtener datos de la API
    const respuesta = await fetch(API_URL);
    const datos = await respuesta.json();

    // Guardar en localStorage para uso offline
    localStorage.setItem('country-datos', JSON.stringify(datos));
    localStorage.setItem('country-fecha', new Date().toLocaleString());

    mostrarDatos(datos);

  } catch (error) {
    // Sin conexión: usar datos guardados
    console.log('Sin conexión, usando datos en caché local');

    const datosGuardados = localStorage.getItem('country-datos');
    const fechaGuardada = localStorage.getItem('country-fecha');

    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      mostrarDatos(datos);

      // Avisar al usuario que los datos son del caché
      const aviso = document.createElement('p');
      aviso.style.cssText = 'color: #e67e22; font-size: 13px; text-align: center; margin-top: 8px;';
      aviso.textContent = `Sin conexión. Mostrando datos guardados del ${fechaGuardada}.`;
      document.querySelector('.dashboard').appendChild(aviso);
    } else {
      // No hay datos guardados
      const listaAvisos = document.getElementById('lista-avisos');
      if (listaAvisos) listaAvisos.innerHTML = '<li>Sin conexión y sin datos guardados.</li>';
      const estadoExpensas = document.getElementById('estado-expensas');
      if (estadoExpensas) estadoExpensas.textContent = 'Sin conexión. Conectate para ver tus expensas.';
    }
  }
}

window.addEventListener('load', cargarDatos);
