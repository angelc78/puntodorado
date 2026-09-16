// precio.js
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOb8tl861tZb5oC5Yd6ssclDEBdxYASBGzmExv4DaKISeun9avcVZUerICvF5A09xiC92SNNOijfim/pub?output=csv";

async function actualizarPrecios() {
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    const textoCSV = await respuesta.text();
    const precios = parsearCSV(textoCSV);

    document.querySelectorAll('[data-price-id]').forEach((elemento) => {
      const id = elemento.dataset.priceId;
      if (precios[id] !== undefined) {
        elemento.textContent = `$${precios[id].toLocaleString('es-AR')}`;
      }
    });
  } catch (error) {
    console.error('No se pudieron actualizar los precios:', error);
  }
}

// Separa una línea de CSV respetando los campos entre comillas
// (necesario porque Google exporta los precios como "$8,500", con coma adentro)
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

function parsearCSV(csv) {
  const filas = csv.trim().split('\n');
  const precios = {};

  for (let i = 1; i < filas.length; i++) {
    const columnas = parsearLineaCSV(filas[i]);
    const id = columnas[0]?.trim();
    const precioTexto = columnas[2]?.trim();
    if (id && precioTexto) {
      const numero = Number(precioTexto.replace(/[^0-9]/g, ''));
      if (!isNaN(numero)) {
        precios[id] = numero;
      }
    }
  }

  return precios;
}

document.addEventListener('DOMContentLoaded', actualizarPrecios);
