// precio.js
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOb8tl861tZb5oC5Yd6ssclDEBdxYASBGzmExv4DaKISeun9avcVZUerICvF5A09xiC92SNNOijfim/pub?output=csv";

async function actualizarPrecios() {
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    const textoCSV = await respuesta.text();
    const productos = parsearCSV(textoCSV);

    // Actualiza los precios
    document.querySelectorAll('[data-price-id]').forEach((elemento) => {
      const id = elemento.dataset.priceId;
      if (productos[id]?.precio !== undefined) {
        elemento.textContent = `$${productos[id].precio.toLocaleString('es-AR')}`;
      }
    });

    // Marca como agotado el producto que tenga stock en 0
    document.querySelectorAll('.producto-card[data-stock-id]').forEach((card) => {
      const id = card.dataset.stockId;
      const stock = productos[id]?.stock;
      if (stock !== undefined && stock <= 0) {
        card.classList.add('agotado');
        const boton = card.querySelector('.producto-cta');
        if (boton) {
          boton.classList.add('agotado');
          boton.textContent = 'Agotado · Pedí tu reserva';
          boton.href = boton.href.replace(/pedir/i, 'reservar');
        }
      }
    });
  } catch (error) {
    console.error('No se pudieron actualizar los precios:', error);
  }
}

// Separa una línea de CSV respetando los campos entre comillas
function parsearLineaCSV(linea) {
  const columnas = [];
  let actual = '';
  let entreComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      entreComillas = !entreComillas;
    } else if (c === ',' && !entreComillas) {
      columnas.push(actual);
      actual = '';
    } else {
      actual += c;
    }
  }
  columnas.push(actual);
  return columnas;
}

// Espera columnas: id, nombre, precio, stock (en ese orden)
function parsearCSV(csv) {
  const filas = csv.trim().split('\n');
  const productos = {};

  for (let i = 1; i < filas.length; i++) {
    const columnas = parsearLineaCSV(filas[i]);
    const id = columnas[0]?.trim();
    if (!id) continue;

    const precioTexto = columnas[2]?.trim();
    const stockTexto = columnas[3]?.trim();

    const precio = precioTexto ? Number(precioTexto.replace(/[^0-9]/g, '')) : NaN;
    const stock = stockTexto !== undefined && stockTexto !== '' ? Number(stockTexto.replace(/[^0-9]/g, '')) : NaN;

    productos[id] = {
      precio: !isNaN(precio) ? precio : undefined,
      stock: !isNaN(stock) ? stock : undefined,
    };
  }

  return productos;
}

document.addEventListener('DOMContentLoaded', actualizarPrecios);
