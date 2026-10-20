import './style.css'

// Buscamos en el HTML los elementos que vamos a actualizar o escuchar.
const contenedorClientes = document.querySelector('#contenedorClientes')
const mensaje = document.querySelector('#mensaje')
const cambiarVista = document.querySelector('#cambiarVista')
const spinner = document.querySelector('#spinner')

// Busca una cookie por su nombre y devuelve su valor.
function leerCookie(nombre) {
  const cookie = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(`${nombre}=`))

  return cookie ? cookie.split('=')[1] : null
}

// Recupera la última vista elegida; si no hay cookie, se usa tabla.
cambiarVista.checked = leerCookie('vistaClientes') === 'cuadricula'

// Descarga el archivo JSON desde public/datadb y devuelve la lista de clientes.
async function obtenerClientes() {
  const respuesta = await fetch('/datadb/data.json')

  // Si el servidor responde con error, detenemos la carga y mostramos el motivo.
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al cargar los datos`)
  }

  // Convierte el contenido JSON en datos que JavaScript puede utilizar.
  const clientes = await respuesta.json()

  // Comprobamos que los datos tengan forma de arreglo.
  if (!Array.isArray(clientes)) {
    throw new Error('El archivo de clientes no contiene un arreglo')
  }

  return clientes
}

// Carga los clientes y los muestra en tabla o cuadrícula
async function mostrarClientes() {
  try {
    // Espera breve para que el spinner se pueda observar durante la demostración.
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Esperamos a que termine la descarga antes de mostrar los clientes.
    const clientes = await obtenerClientes()

    // Esta función se ejecuta al cargar los datos y cada vez que cambia el switch.
    function cambiarFormaVista() {
      if (cambiarVista.checked) {

        // Switch activado: construimos una tarjeta para cada cliente.
        // map crea el HTML de cada cliente y join('') une todas las tarjetas.
        contenedorClientes.innerHTML = `
          <div class="client-grid">
            ${clientes.map(cliente => `
              <article class="client-card">
                <h2>${cliente.Nombre} ${cliente.Apellido}</h2>
                <p><strong>ID:</strong> ${cliente.ID_CLIENTE}</p>
                <p><strong>Teléfono:</strong> ${cliente.Telefono}</p>
                <p><strong>Correo:</strong> ${cliente.Email}</p>
                <p><strong>Dirección:</strong> ${cliente.Direccion}</p>
              </article>
            `).join('')}
          </div>
        `
      } else {

        // Switch desactivado: mostramos los mismos datos en una tabla.
        // Cada cliente se convierte en una fila (<tr>) de la tabla.
        contenedorClientes.innerHTML = `
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                ${clientes.map(cliente => `
                  <tr>
                    <td>${cliente.ID_CLIENTE}</td>
                    <td>${cliente.Nombre}</td>
                    <td>${cliente.Apellido}</td>
                    <td>${cliente.Telefono}</td>
                    <td>${cliente.Email}</td>
                    <td>${cliente.Direccion}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
      }
    }

    // Muestra la vista inicial según la posición actual del switch.
    cambiarFormaVista()

    // Guarda la vista elegida y actualiza el contenido al cambiar el switch.
    cambiarVista.addEventListener('change', () => {
      const vista = cambiarVista.checked ? 'cuadricula' : 'tabla'
      document.cookie = `vistaClientes=${vista}; max-age=2592000; path=/; SameSite=Lax`
      cambiarFormaVista()
    })

    // Informa cuántos clientes se han cargado correctamente.
    mensaje.textContent = `${clientes.length} clientes cargados`
  } catch (error) {

    // Si falla la descarga o el procesamiento, mostramos el error en la página.
    mensaje.textContent = error.message
    mensaje.classList.add('error')
    // También lo escribimos en la consola para facilitar la depuración.
    console.error(error)


  } finally {

    // El spinner se oculta tanto si la carga termina bien como si da error.
    spinner.hidden = true
  }
}

// Inicia la carga cuando se ejecuta este archivo.
mostrarClientes()
