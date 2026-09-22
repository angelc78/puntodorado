// precio.js
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOb8tl861tZb5oC5Yd6ssclDEBdxYASBGzmExv4DaKISeun9avcVZUerICvF5A09xiC92SNNOijfim/pub?output=csv";
const NUMERO_WHATSAPP = "541168780760";

async function cargarCatalogo() {
  const grilla = document.getElementById('productos-grid');
  if (!grilla) return;
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    const textoCSV = await respuesta.text();
    const productos = parsearCSV(textoCSV);
    grilla.innerHTML = '';
    productos.forEach((producto, index) => grilla.appendChild(crearCard(producto, index)));
  } catch (error) {
    console.error('No se pudo cargar el catálogo:', error);
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

  card.innerHTML = `
    <div class="producto-num">${numero}</div>
    <div class="producto-icon">${producto.icono || '🧀'}</div>
    <h3 class="producto-nombre">${producto.nombre}</h3>
    <p class="producto-desc">${producto.descripcion || ''}</p>
    <div class="producto-precio">
      <span class="precio-valor">${precioTexto}</span>
      <span class="precio-detalle">${producto.detalle || ''}</span>
    </div>
    <a href="${linkWhatsapp}" class="producto-cta${agotado ? ' agotado' : ''}" target="_blank">${textoBoton}</a>
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

// Espera columnas: id, nombre, descripcion, precio, stock, icono, detalle
function parsearCSV(csv) {
  const filas = csv.trim().split(/\r?\n/);
  const productos = [];
  for (let i = 1; i < filas.length; i++) {
    const columnas = parsearLineaCSV(filas[i]);
    const id = columnas[0]?.trim();
    if (!id) continue;
    const precioTexto = columnas[3]?.trim();
    const stockTexto = columnas[4]?.trim();
    const precio = precioTexto ? Number(precioTexto.replace(/[^0-9]/g, '')) : NaN;
    const stock = stockTexto ? Number(stockTexto.replace(/[^0-9]/g, '')) : NaN;
    productos.push({
      id,
      nombre: columnas[1]?.trim() || '',
      descripcion: columnas[2]?.trim() || '',
      precio: !isNaN(precio) ? precio : undefined,
      stock: !isNaN(stock) ? stock : undefined,
      icono: columnas[5]?.trim() || '',
      detalle: columnas[6]?.trim() || '',
    });
  }
  return productos;
}

document.addEventListener('DOMContentLoaded', cargarCatalogo);
