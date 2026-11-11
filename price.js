// price.js
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOb8tl861tZb5oC5Yd6ssclDEBdxYASBGzmExv4DaKISeun9avcVZUerICvF5A09xiC92SNNOijfim/pub?output=csv";
const NUMERO_WHATSAPP = "541168780760";

async function cargarCatalogo() {
  const grilla = document.getElementById('productos-grid');
  if (!grilla) return;

  grilla.innerHTML = '<p class="catalogo-estado">Cargando productos...</p>';

  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const textoCSV = await respuesta.text();
    const productos = parsearCSV(textoCSV);
    if (productos.length === 0) throw new Error('Catálogo vacío');

    grilla.innerHTML = '';
    productos.forEach((producto, index) => grilla.appendChild(crearCard(producto, index)));
  } catch (error) {
    console.error('No se pudo cargar el catálogo:', error);
    grilla.innerHTML = `
      <p class="catalogo-estado">No pudimos cargar el catálogo en este momento.<br>Escribinos por WhatsApp y te contamos qué tenemos disponible.</p>
      <a href="https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent('Hola! Quiero saber qué tequeños tienen disponibles')}" class="producto-cta" target="_blank" style="margin: 0 auto;">Escribinos por WhatsApp</a>
    `;
  }
}

function crearCard(producto, index) {
  const numero = String(index + 1).padStart(2, '0');
  const agotado = producto.stock !== undefined && producto.stock <= 0;
  const card = document.createElement('div');
  card.className = 'producto-card reveal visible' + (agotado ? ' agotado' : '');
  card.dataset.stockId = producto.id;

  const precioTexto = producto.precio !== undefined ? `$${producto.precio.toLocaleString('es-AR')}` : '';
  const mensaje = agotado ? `Hola! Quiero reservar ${producto.nombre} 🧀` : `Hola! Quiero pedir ${producto.nombre} 🧀`;
  const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  const textoBoton = agotado ? 'Agotado · Pedí tu reserva' : 'Pedir por WhatsApp';

  const imagenHtml = producto.imagen
    ? `<img class="producto-imagen" src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">`
    : `<div class="producto-imagen producto-imagen--fallback"><span>${producto.icono || '🧀'}</span></div>`;

  card.innerHTML = `
    <div class="producto-imagen-wrap">
      ${imagenHtml}
      <div class="producto-num">${numero}</div>
    </div>
    <div class="producto-info">
      <h3 class="producto-nombre">${producto.nombre}</h3>
      <p class="producto-desc">${producto.descripcion || ''}</p>
      <div class="producto-precio">
        <span class="precio-valor">${precioTexto}</span>
        <span class="precio-detalle">${producto.detalle || ''}</span>
      </div>
      <a href="${linkWhatsapp}" class="producto-cta${agotado ? ' agotado' : ''}" target="_blank">${textoBoton}</a>
    </div>
  `;
  return card;
}

function parsearLineaCSV(linea) {
  const columnas = [];
  let actual = '';
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') entreComillas = !entreComillas;
    else if (c === ',' && !entreComillas) { columnas.push(actual); actual = ''; }
    else actual += c;
  }
  columnas.push(actual);
  return columnas;
}

// Espera columnas: id, nombre, descripcion, precio, stock, icono, detalle, imagen
// Lee las columnas por el nombre de encabezado (fila 1), no por posición
function parsearCSV(csv) {
  const filas = csv.trim().split(/\r?\n/);
  if (filas.length < 2) return [];
  const encabezados = parsearLineaCSV(filas[0]).map(h => h.trim().toLowerCase());
  const productos = [];

  for (let i = 1; i < filas.length; i++) {
    const columnas = parsearLineaCSV(filas[i]);
    const fila = {};
    encabezados.forEach((nombreCol, idx) => {
      fila[nombreCol] = columnas[idx]?.trim() || '';
    });

    const id = fila['id'];
    if (!id) continue;

    const precio = fila['precio'] ? Number(fila['precio'].replace(/[^0-9]/g, '')) : NaN;
    const stock = fila['stock'] ? Number(fila['stock'].replace(/[^0-9]/g, '')) : NaN;

    productos.push({
      id,
      nombre: fila['nombre'] || '',
      descripcion: fila['descripcion'] || '',
      precio: !isNaN(precio) ? precio : undefined,
      stock: !isNaN(stock) ? stock : undefined,
      icono: fila['icono'] || '',
      detalle: fila['detalle'] || '',
      imagen: fila['imagen'] || '',
    });
  }

  return productos;
}

document.addEventListener('DOMContentLoaded', cargarCatalogo);
