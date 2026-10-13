/* =====================================================
   SISTEMA DE GESTIÓN DE SERVICIOS TÉCNICOS
   Archivo: js/app.js
   Prototipo académico SENA - Análisis y Desarrollo de Software
   ===================================================== */

'use strict';


/* =====================================================
   1. DATOS Y CONSTANTES DEL PROTOTIPO
   Los datos viven solo en memoria: al recargar la página
   (F5) se pierden los equipos registrados.
   ===================================================== */

// Claves de estado (las mismas del selector #filtro-estado) y su texto visible
const ESTADOS = {
  abierta: 'Abierta',
  diagnostico: 'En diagnóstico',
  reparacion: 'En reparación',
  listo: 'Listo para entregar'
};

// Valores del selector #equipo-tipo y su texto visible
const TIPOS_EQUIPO = {
  computador: 'Computador',
  celular: 'Celular',
  impresora: 'Impresora',
  otro: 'Otro'
};

const NO_ESPECIFICADO = 'No especificado';
const USUARIO_DEMO = 'Usuario Demo';
const MAXIMO_RECIENTES = 5;

// Pantallas internas (solo una se muestra a la vez)
const PANTALLAS_INTERNAS = [
  'pantalla-panel-principal',
  'pantalla-solicitudes',
  'pantalla-registrar-equipo',
  'vista-confirmacion-registro',
  'pantalla-detalle-solicitud'
];

// Pantallas que no están en el menú lateral: qué opción del menú se marca como activa
const OPCION_MENU_DE_PANTALLA = {
  'pantalla-detalle-solicitud': 'pantalla-solicitudes',
  'vista-confirmacion-registro': 'pantalla-registrar-equipo'
};

// Solicitudes de ejemplo (datos ficticios, coherentes con las tablas del HTML)
const solicitudes = [
  {
    ticket: 'ST-0001',
    fecha: '2026-10-05',
    nombreEquipo: 'Portátil HP Pavilion',
    clienteNombre: 'Carlos Ejemplo',
    clienteTelefono: '3000000000',
    tipo: 'Computador',
    marca: 'HP',
    modelo: 'Pavilion 15',
    serie: 'SN-000000',
    falla: 'El equipo no enciende al presionar el botón de encendido.',
    observaciones: 'Ingresa con cargador. Carcasa con rayones leves.',
    diagnostico: 'Pendiente de revisión de la fuente de poder.',
    prioridad: 'Alta',
    tecnico: 'Técnico Uno',
    estado: 'diagnostico',
    historial: [
      { fecha: '2026-10-05', estado: 'Abierta' },
      { fecha: '2026-10-06', estado: 'En diagnóstico' }
    ]
  },
  {
    ticket: 'ST-0002',
    fecha: '2026-10-06',
    nombreEquipo: 'Celular Samsung Galaxy A12',
    clienteNombre: 'María Prueba',
    clienteTelefono: '3000000001',
    tipo: 'Celular',
    marca: 'Samsung',
    modelo: 'Galaxy A12',
    serie: 'SN-000002',
    falla: 'La pantalla no responde al tacto.',
    observaciones: 'Ingresa sin funda. Batería con desgaste.',
    diagnostico: 'Pantalla táctil defectuosa; se requiere reemplazar el módulo.',
    prioridad: 'Media',
    tecnico: 'Técnico Dos',
    estado: 'reparacion',
    historial: [
      { fecha: '2026-10-06', estado: 'Abierta' },
      { fecha: '2026-10-07', estado: 'En diagnóstico' },
      { fecha: '2026-10-08', estado: 'En reparación' }
    ]
  },
  {
    ticket: 'ST-0003',
    fecha: '2026-10-08',
    nombreEquipo: 'Impresora Epson L3150',
    clienteNombre: 'Luis Demostración',
    clienteTelefono: '3000000002',
    tipo: 'Impresora',
    marca: 'Epson',
    modelo: 'L3150',
    serie: 'SN-000003',
    falla: 'Las impresiones salen con líneas horizontales.',
    observaciones: 'Ingresa con cable de poder.',
    diagnostico: 'Cabezales sucios; limpieza realizada y pruebas de impresión correctas.',
    prioridad: 'Baja',
    tecnico: 'Técnico Uno',
    estado: 'listo',
    historial: [
      { fecha: '2026-10-08', estado: 'Abierta' },
      { fecha: '2026-10-09', estado: 'En diagnóstico' },
      { fecha: '2026-10-10', estado: 'En reparación' },
      { fecha: '2026-10-11', estado: 'Listo para entregar' }
    ]
  }
];


/* =====================================================
   2. ELEMENTOS DEL HTML
   ===================================================== */
const pantallaLogin = document.getElementById('pantalla-inicio-sesion');
const formLogin = document.getElementById('form-login');
const campoUsuario = document.getElementById('login-usuario');
const campoClave = document.getElementById('login-clave');
const interfazInterna = document.getElementById('interfaz-interna');
const usuarioNombre = document.getElementById('usuario-nombre');
const botonCerrarSesion = document.getElementById('btn-cerrar-sesion');

const formFiltros = document.getElementById('form-filtros');
const campoBusqueda = document.getElementById('buscar-solicitud');
const selectorEstado = document.getElementById('filtro-estado');
const tablaSolicitudes = document.getElementById('tabla-solicitudes');
const tablaRecientes = document.getElementById('tabla-solicitudes-recientes');
const mensajeSinResultados = document.getElementById('mensaje-sin-resultados');

const formRegistro = document.getElementById('form-registrar-equipo');
const mensajesFormulario = document.getElementById('mensajes-formulario');


/* =====================================================
   3. UTILIDADES GENERALES
   ===================================================== */

/**
 * Muestra u oculta un elemento.
 * Se usa "hidden" y también style.display porque algunas clases del CSS
 * (.pantalla-login, .interfaz-interna) definen display y anularían a "hidden".
 */
function cambiarVisibilidad(elemento, visible) {
  if (!elemento) return;
  elemento.hidden = !visible;
  elemento.style.display = visible ? '' : 'none';
}

/** Devuelve el texto, o "No especificado" si está vacío. */
function valorOEspecificado(valor) {
  return valor && String(valor).trim() !== '' ? valor : NO_ESPECIFICADO;
}

/** Escribe un texto (de forma segura) en el elemento con ese id. */
function escribirTexto(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valorOEspecificado(texto);
}

/** Fecha de hoy en formato AAAA-MM-DD (hora local). */
function obtenerFechaActual() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return hoy.getFullYear() + '-' + mes + '-' + dia;
}

/** Pasa a minúsculas y quita tildes para comparar textos en la búsqueda. */
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}


/* =====================================================
   4. NAVEGACIÓN ENTRE PANTALLAS
   ===================================================== */

/** Marca con aria-current la opción activa del menú lateral. */
function marcarOpcionActivaDelMenu(idPantalla) {
  document.querySelectorAll('.menu-enlace').forEach(function (enlace) {
    if (enlace.dataset.pantalla === idPantalla) {
      enlace.setAttribute('aria-current', 'page');
    } else {
      enlace.removeAttribute('aria-current');
    }
  });
}

/** Muestra una sola pantalla interna y oculta las demás. */
function mostrarPantalla(idPantalla) {
  if (!PANTALLAS_INTERNAS.includes(idPantalla)) return;

  PANTALLAS_INTERNAS.forEach(function (id) {
    cambiarVisibilidad(document.getElementById(id), id === idPantalla);
  });

  marcarOpcionActivaDelMenu(OPCION_MENU_DE_PANTALLA[idPantalla] || idPantalla);

  // Vuelve arriba y lleva el foco al título para quienes usan lector de pantalla
  window.scrollTo(0, 0);
  const pantalla = document.getElementById(idPantalla);
  const titulo = pantalla ? pantalla.querySelector('h1') : null;
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
}

/** Atiende los clics en cualquier enlace con data-pantalla (menú, accesos, tablas, regresar). */
function manejarClicNavegacion(evento) {
  const control = evento.target.closest('[data-pantalla]');
  if (!control) return;

  evento.preventDefault();
  const destino = control.dataset.pantalla;

  // Si es un enlace de detalle, primero se carga la información del ticket
  if (destino === 'pantalla-detalle-solicitud') {
    const fila = control.closest('tr');
    const ticket = control.dataset.ticket || (fila ? fila.cells[0].textContent.trim() : '');
    if (!mostrarDetalle(ticket)) return;
  }

  mostrarPantalla(destino);
}


/* =====================================================
   5. INICIO Y CIERRE DE SESIÓN (DEMOSTRATIVO)
   No existe autenticación real: solo se simula el acceso.
   ===================================================== */

function iniciarSesion(evento) {
  evento.preventDefault();

  const nombre = campoUsuario.value.trim();
  if (nombre === '') {
    campoUsuario.setCustomValidity('Escribe tu usuario o correo electrónico.');
    campoUsuario.reportValidity();
    return;
  }

  usuarioNombre.textContent = nombre;
  formLogin.reset(); // borra usuario y contraseña del formulario

  cambiarVisibilidad(pantallaLogin, false);
  cambiarVisibilidad(interfazInterna, true);
  mostrarPantalla('pantalla-panel-principal');
}

function cerrarSesion() {
  cambiarVisibilidad(interfazInterna, false);
  cambiarVisibilidad(pantallaLogin, true);

  PANTALLAS_INTERNAS.forEach(function (id) {
    cambiarVisibilidad(document.getElementById(id), false);
  });

  usuarioNombre.textContent = USUARIO_DEMO;
  campoUsuario.setCustomValidity('');
  formLogin.reset();

  if (formRegistro) formRegistro.reset(); // también limpia los mensajes
  if (formFiltros) {
    formFiltros.reset();
    aplicarFiltros();
  }

  campoUsuario.focus();
}


/* =====================================================
   6. TABLAS Y PANEL PRINCIPAL
   Todo el contenido se crea con textContent (nunca innerHTML)
   ===================================================== */

function crearCelda(texto) {
  const celda = document.createElement('td');
  celda.textContent = texto;
  return celda;
}

/** Crea el enlace "Ver detalle" / "Abrir detalle" de una fila. */
function crearEnlaceDetalle(solicitud, textoEnlace) {
  const enlace = document.createElement('a');
  enlace.href = '#pantalla-detalle-solicitud';
  enlace.className = 'enlace-detalle';
  enlace.dataset.pantalla = 'pantalla-detalle-solicitud';
  enlace.dataset.ticket = solicitud.ticket;
  enlace.textContent = textoEnlace;
  enlace.setAttribute('aria-label', textoEnlace + ' del ticket ' + solicitud.ticket);
  return enlace;
}

/** Fila de la tabla "Solicitudes recientes" (5 columnas). */
function crearFilaReciente(solicitud) {
  const fila = document.createElement('tr');
  fila.dataset.estado = solicitud.estado; // permite que el CSS coloree la insignia de estado
  fila.append(
    crearCelda(solicitud.ticket),
    crearCelda(solicitud.nombreEquipo),
    crearCelda(solicitud.clienteNombre),
    crearCelda(ESTADOS[solicitud.estado])
  );
  const celdaAccion = document.createElement('td');
  celdaAccion.appendChild(crearEnlaceDetalle(solicitud, 'Ver detalle'));
  fila.appendChild(celdaAccion);
  return fila;
}

/** Fila de la tabla "Solicitudes de servicio" (8 columnas). */
function crearFilaSolicitud(solicitud) {
  const fila = document.createElement('tr');
  fila.dataset.estado = solicitud.estado; // se usa en el filtro por estado
  fila.append(
    crearCelda(solicitud.ticket),
    crearCelda(solicitud.fecha),
    crearCelda(solicitud.nombreEquipo),
    crearCelda(solicitud.clienteNombre),
    crearCelda(solicitud.prioridad),
    crearCelda(ESTADOS[solicitud.estado]),
    crearCelda(solicitud.tecnico)
  );
  const celdaAccion = document.createElement('td');
  celdaAccion.appendChild(crearEnlaceDetalle(solicitud, 'Abrir detalle'));
  fila.appendChild(celdaAccion);
  return fila;
}

/** Vuelve a dibujar las dos tablas a partir de los datos. */
function renderizarTablas() {
  if (tablaRecientes && tablaRecientes.tBodies[0]) {
    const cuerpo = tablaRecientes.tBodies[0];
    cuerpo.replaceChildren();
    // Las más nuevas primero, máximo MAXIMO_RECIENTES
    solicitudes.slice(-MAXIMO_RECIENTES).reverse().forEach(function (solicitud) {
      cuerpo.appendChild(crearFilaReciente(solicitud));
    });
  }

  if (tablaSolicitudes && tablaSolicitudes.tBodies[0]) {
    const cuerpo = tablaSolicitudes.tBodies[0];
    cuerpo.replaceChildren();
    solicitudes.forEach(function (solicitud) {
      cuerpo.appendChild(crearFilaSolicitud(solicitud));
    });
  }

  aplicarFiltros(); // respeta la búsqueda y el filtro que estén activos
}

/** Escribe el número de una tarjeta del panel (por ejemplo ".tarjeta-listos"). */
function escribirValorTarjeta(selectorTarjeta, valor) {
  const elemento = document.querySelector(selectorTarjeta + ' .tarjeta-valor');
  if (elemento) elemento.textContent = valor;
}

/** Cuenta las solicitudes según su estado y actualiza las cuatro tarjetas. */
function actualizarPanel() {
  const contador = { abierta: 0, diagnostico: 0, reparacion: 0, listo: 0 };
  solicitudes.forEach(function (solicitud) {
    contador[solicitud.estado] += 1;
  });

  escribirValorTarjeta('.tarjeta-abiertas', contador.abierta);
  escribirValorTarjeta('.tarjeta-diagnostico', contador.diagnostico);
  escribirValorTarjeta('.tarjeta-reparacion', contador.reparacion);
  escribirValorTarjeta('.tarjeta-listos', contador.listo);
}


/* =====================================================
   7. BÚSQUEDA Y FILTRO DE SOLICITUDES
   ===================================================== */

/** Oculta las filas que no coinciden con la búsqueda y el estado elegidos. */
function aplicarFiltros() {
  if (!tablaSolicitudes || !tablaSolicitudes.tBodies[0]) return;

  const textoBuscado = campoBusqueda ? normalizarTexto(campoBusqueda.value) : '';
  const estadoElegido = selectorEstado ? selectorEstado.value : '';
  let filasVisibles = 0;

  Array.from(tablaSolicitudes.tBodies[0].rows).forEach(function (fila) {
    // Se busca en: ticket (col. 0), equipo (col. 2) y cliente (col. 3)
    const textoFila = normalizarTexto(
      fila.cells[0].textContent + ' ' +
      fila.cells[2].textContent + ' ' +
      fila.cells[3].textContent
    );
    const coincideTexto = textoFila.includes(textoBuscado);
    const coincideEstado = estadoElegido === '' || fila.dataset.estado === estadoElegido;
    const mostrar = coincideTexto && coincideEstado;

    fila.hidden = !mostrar;
    if (mostrar) filasVisibles += 1;
  });

  // La clase "visible" ya existe en el CSS
  if (mensajeSinResultados) {
    mensajeSinResultados.classList.toggle('visible', filasVisibles === 0);
  }
}


/* =====================================================
   8. REGISTRO DE EQUIPOS
   ===================================================== */

/** Muestra un mensaje en el espacio del formulario (esExito = true lo muestra en verde). */
function mostrarMensajeFormulario(texto, esExito) {
  if (!mensajesFormulario) return;
  mensajesFormulario.textContent = texto;
  mensajesFormulario.classList.toggle('mensaje-exito', Boolean(esExito));
}

/** Borra los mensajes y las marcas de error del formulario. */
function limpiarMensajesFormulario() {
  if (mensajesFormulario) {
    mensajesFormulario.textContent = ''; // vacío: el CSS lo oculta
    mensajesFormulario.classList.remove('mensaje-exito');
  }
  if (formRegistro) {
    formRegistro.querySelectorAll('[aria-invalid]').forEach(function (campo) {
      campo.removeAttribute('aria-invalid');
    });
  }
}

/** Texto de la etiqueta de un campo, sin el asterisco. */
function obtenerEtiqueta(campo) {
  const etiqueta = document.querySelector('label[for="' + campo.id + '"]');
  return etiqueta ? etiqueta.textContent.replace(/\*/g, '').trim() : campo.name;
}

/** Revisa el formulario. Devuelve la lista de mensajes de error y el primer campo con problema. */
function validarFormularioRegistro() {
  const camposFaltantes = [];
  const mensajes = [];
  let primerCampoInvalido = null;

  // 1. Campos obligatorios (los que tienen el atributo required en el HTML)
  Array.from(formRegistro.elements).forEach(function (campo) {
    if (!campo.name || !campo.required) return;
    if (campo.value.trim() === '') {
      campo.setAttribute('aria-invalid', 'true');
      camposFaltantes.push(obtenerEtiqueta(campo));
      if (!primerCampoInvalido) primerCampoInvalido = campo;
    }
  });

  if (camposFaltantes.length > 0) {
    mensajes.push('Completa los campos obligatorios: ' + camposFaltantes.join(', ') + '.');
  }

  // 2. Teléfono: solo números, +, espacios, paréntesis o guiones (7 a 15 dígitos)
  const campoTelefono = document.getElementById('cliente-telefono');
  const telefono = campoTelefono ? campoTelefono.value.trim() : '';
  if (telefono !== '') {
    const cantidadDigitos = telefono.replace(/\D/g, '').length;
    const caracteresValidos = /^[0-9+()\s-]+$/.test(telefono);
    if (!caracteresValidos || cantidadDigitos < 7 || cantidadDigitos > 15) {
      campoTelefono.setAttribute('aria-invalid', 'true');
      mensajes.push('El teléfono de contacto debe tener entre 7 y 15 números.');
      if (!primerCampoInvalido) primerCampoInvalido = campoTelefono;
    }
  }

  return { mensajes: mensajes, primerCampo: primerCampoInvalido };
}

/** Siguiente número de ticket: ST-0004, ST-0005... sin repetir. */
function generarNumeroTicket() {
  let mayor = 0;
  solicitudes.forEach(function (solicitud) {
    const numero = parseInt(solicitud.ticket.replace('ST-', ''), 10);
    if (numero > mayor) mayor = numero;
  });
  return 'ST-' + String(mayor + 1).padStart(4, '0');
}

/** Valor limpio (sin espacios sobrantes) de un campo del formulario. */
function leerCampo(id) {
  const campo = document.getElementById(id);
  return campo ? campo.value.trim() : '';
}

/** Crea una solicitud nueva con los datos del formulario. */
function crearSolicitudNueva() {
  const tipo = TIPOS_EQUIPO[leerCampo('equipo-tipo')] || leerCampo('equipo-tipo');
  const marca = leerCampo('equipo-marca');
  const modelo = leerCampo('equipo-modelo');
  const hoy = obtenerFechaActual();

  return {
    ticket: generarNumeroTicket(),
    fecha: hoy,
    nombreEquipo: tipo + ' ' + marca + ' ' + modelo,
    clienteNombre: leerCampo('cliente-nombre'),
    clienteTelefono: leerCampo('cliente-telefono'),
    tipo: tipo,
    marca: marca,
    modelo: modelo,
    serie: leerCampo('equipo-serie'),
    falla: leerCampo('equipo-falla'),
    observaciones: leerCampo('equipo-observaciones'),
    diagnostico: 'Pendiente de diagnóstico',
    prioridad: 'Media',        // el formulario no pregunta la prioridad
    tecnico: 'Sin asignar',    // ni el técnico: valores por defecto del prototipo
    estado: 'abierta',
    historial: [{ fecha: hoy, estado: ESTADOS.abierta }]
  };
}

/** Rellena la vista de confirmación con el ticket y el equipo registrados. */
function mostrarConfirmacion(solicitud) {
  escribirTexto('confirmacion-ticket', solicitud.ticket);
  escribirTexto('confirmacion-equipo', solicitud.nombreEquipo);
}

/** Se ejecuta al pulsar "Registrar equipo". */
function registrarEquipo(evento) {
  evento.preventDefault(); // evita que la página se recargue
  limpiarMensajesFormulario();

  const resultado = validarFormularioRegistro();
  if (resultado.mensajes.length > 0) {
    mostrarMensajeFormulario(resultado.mensajes.join(' '), false);
    if (resultado.primerCampo) resultado.primerCampo.focus();
    return;
  }

  const solicitud = crearSolicitudNueva();
  solicitudes.push(solicitud);

  renderizarTablas();
  actualizarPanel();
  mostrarConfirmacion(solicitud);

  formRegistro.reset();
  mostrarPantalla('vista-confirmacion-registro');
}


/* =====================================================
   9. DETALLE DE UNA SOLICITUD
   ===================================================== */

/** Carga los datos del ticket en la pantalla de detalle. Devuelve false si no existe. */
function mostrarDetalle(ticket) {
  const solicitud = solicitudes.find(function (s) {
    return s.ticket === ticket;
  });
  if (!solicitud) return false;

  escribirTexto('detalle-ticket', solicitud.ticket);
  escribirTexto('detalle-fecha', solicitud.fecha);
  escribirTexto('detalle-prioridad', solicitud.prioridad);
  escribirTexto('detalle-tecnico', solicitud.tecnico);
  escribirTexto('detalle-estado', ESTADOS[solicitud.estado]);
  escribirTexto('detalle-cliente-nombre', solicitud.clienteNombre);
  escribirTexto('detalle-cliente-telefono', solicitud.clienteTelefono);
  escribirTexto('detalle-equipo-tipo', solicitud.tipo);
  escribirTexto('detalle-equipo-marca', solicitud.marca);
  escribirTexto('detalle-equipo-modelo', solicitud.modelo);
  escribirTexto('detalle-equipo-serie', solicitud.serie);
  escribirTexto('detalle-falla', solicitud.falla);
  escribirTexto('detalle-observaciones', solicitud.observaciones);
  escribirTexto('detalle-diagnostico', solicitud.diagnostico);

  mostrarHistorial(solicitud.historial);
  return true;
}

/** Dibuja la lista del historial de estados. */
function mostrarHistorial(historial) {
  const lista = document.getElementById('lista-historial');
  if (!lista) return;

  lista.replaceChildren();

  if (!historial || historial.length === 0) {
    const itemVacio = document.createElement('li');
    itemVacio.textContent = NO_ESPECIFICADO;
    lista.appendChild(itemVacio);
    return;
  }

  historial.forEach(function (registro) {
    const item = document.createElement('li');
    const hora = document.createElement('time');
    hora.dateTime = registro.fecha;
    hora.textContent = registro.fecha;
    item.append(hora, ' — ' + registro.estado);
    lista.appendChild(item);
  });
}


/* =====================================================
   10. INICIO DE LA APLICACIÓN
   ===================================================== */
function iniciar() {
  // Estado inicial: solo se ve el inicio de sesión
  PANTALLAS_INTERNAS.forEach(function (id) {
    cambiarVisibilidad(document.getElementById(id), false);
  });
  cambiarVisibilidad(interfazInterna, false);
  cambiarVisibilidad(pantallaLogin, true);

  // Datos en pantalla
  renderizarTablas();
  actualizarPanel();

  // Navegación (funciona también con las filas que se creen después)
  document.addEventListener('click', manejarClicNavegacion);

  // Sesión
  if (formLogin) formLogin.addEventListener('submit', iniciarSesion);
  if (campoUsuario) {
    campoUsuario.addEventListener('input', function () {
      campoUsuario.setCustomValidity('');
    });
  }
  if (botonCerrarSesion) botonCerrarSesion.addEventListener('click', cerrarSesion);

  // Búsqueda y filtros
  if (campoBusqueda) campoBusqueda.addEventListener('input', aplicarFiltros);
  if (selectorEstado) selectorEstado.addEventListener('change', aplicarFiltros);
  if (formFiltros) {
    formFiltros.addEventListener('submit', function (evento) {
      evento.preventDefault(); // Enter en el buscador no debe recargar la página
    });
  }

  // Registro de equipos
  if (formRegistro) {
    formRegistro.noValidate = true; // los mensajes de error los muestra este script
    formRegistro.addEventListener('submit', registrarEquipo);
    formRegistro.addEventListener('reset', limpiarMensajesFormulario);
  }
}

iniciar();