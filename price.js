// prices.js
// Este script busca los precios en una hoja de Google Sheets publicada como CSV
// y actualiza automáticamente los precios en la página, sin tocar el HTML.

// 1. Pega aquí el link de tu hoja de Google Sheets publicada como CSV
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOb8tl861tZb5oC5Yd6ssclDEBdxYASBGzmExv4DaKISeun9avcVZUerICvF5A09xiC92SNNOijfim/pub?output=csv";

async function actualizarPrecios() {
  try {
    // Se agrega un parámetro con la hora actual para evitar que el navegador
    // muestre una versión vieja guardada en caché
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    const textoCSV = await respuesta.text();
    const precios = parsearCSV(textoCSV);

    // Busca en la página todos los elementos marcados con data-price-id
    // y les pone el precio que corresponda
    document.querySelectorAll('[data-price-id]').forEach((elemento) => {
      const id = elemento.dataset.priceId;
      if (precios[id]) {
        elemento.textContent = `$${precios[id]}`;
      }
    });
  } catch (error) {
    console.error('No se pudieron actualizar los precios:', error);
  }
}

// Convierte el texto del CSV en un objeto { id: precio }
// Espera que la hoja tenga las columnas: id, nombre, precio (en ese orden)
function parsearCSV(csv) {
  const filas = csv.trim().split('\n');
  const precios = {};

  for (let i = 1; i < filas.length; i++) { // arranca en 1 para saltar el encabezado
    const columnas = filas[i].split(',');
    const id = columnas[0]?.trim();
    const precio = columnas[2]?.trim();
    if (id && precio) {
      precios[id] = precio;
    }
  }

  return precios;
}

// Corre apenas carga la página
document.addEventListener('DOMContentLoaded', actualizarPrecios);