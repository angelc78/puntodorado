// price.js
const SHEET_CSV_URL = "https://google.com";

async function actualizarPrecios() {
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
    
    const textoCSV = await respuesta.text();
    const productos = parsearCSV(textoCSV);

    // 1. Renderizar Precios Dinámicos
    document.querySelectorAll('[data-price-id]').forEach((elemento) => {
      const id = elemento.dataset.priceId;
      if (productos[id]?.precio !== undefined) {
        elemento.textContent = `$${productos[id].precio.toLocaleString('es-AR')}`;
      }
    });

    // 2. Evaluar reglas de Stock Cero
    document.querySelectorAll('.producto-card[data-stock-id]').forEach((card) => {
      const id = card.dataset.stockId;
      const stock = productos[id]?.stock;
      
      if (stock !== undefined && stock <= 0) {
        card.classList.add('agotado');
        const boton = card.querySelector('.producto-cta');
        if (boton) {
          boton.classList.add('agotado');
          boton.textContent = 'Agotado · Reservar';
          boton.href = boton.href.replace(/pedir/i, 'reservar');
        }
      }
    });
  } catch (error) {
    console.error('No se pudieron actualizar los precios:', error);
  }
}

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
  // Limpia saltos de línea (\r\n) que rompen la lectura de datos
  const filas = csv.trim().split(/\r?\n/);
  const productos = {};

  for (let i = 1; i < filas.length; i++) {
    const columnas = parsearLineaCSV(filas[i]);
    const id = columnas[0]?.trim();
    if (!id) continue;

    const precioTexto = columnas[2]?.trim();
    const stockTexto = columnas[3]?.trim();

    const limpiarNumero = (texto) => {
      if (!texto) return NaN;
      let procesado = texto.replace(/[^0-9.,-]/g, '');
      if (procesado.includes(',') && procesado.includes('.')) {
        procesado = procesado.replace(/\./g, '').replace(',', '.');
      } else if (procesado.includes(',')) {
        procesado = procesado.replace(',', '.');
      }
      return parseFloat(procesado);
    };

    const precio = limpiarNumero(precioTexto);
    const stock = limpiarNumero(stockTexto);

    productos[id] = {
      precio: !isNaN(precio) ? precio : undefined,
      stock: !isNaN(stock) ? stock : undefined,
    };
  }

  return productos;
}

document.addEventListener('DOMContentLoaded', actualizarPrecios);
