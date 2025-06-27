// --------------------
// DATOS ZAPATILLAS
// --------------------


const zapatillas = {
  "Vans KNU Skool": {
    img: "img/knu 1.jpeg",
    precio: 55000,
    descripcion: "Zapatilla Vans KNU Skool: estilo retro con máxima comodidad.",
    talles: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
  },
  "Adidas Campus": {
    img: "img/Campus.jpeg",
    precio: 45000,
    descripcion: "Adidas Campus: clásicas y versátiles para cualquier ocasión.",
    talles: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
  },
  "Nike Mocha": {
    img: "img/Mocha.jpeg",
    precio: 65000,
    descripcion: "Nike Mocha: diseño icónico y colores únicos.",
    talles: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
  }
};

// --------------------
// GESTIÓN DEL CARRITO
// --------------------
let cart = JSON.parse(localStorage.getItem("carrito")) || [];

function saveCart() {
  localStorage.setItem("carrito", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(producto) {
  cart.push(producto);
  saveCart();
  alert(`${producto.nombre} (Talle: ${producto.talle}) fue agregado al carrito`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCartItems();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.precio, 0);
}

function updateCartCount() {
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = cart.length;
  });
}

// --------------------
// FUNCIONES GENERALES
// --------------------
function verDetalle(nombre) {
  window.location.href = `detalle.html?nombre=${encodeURIComponent(nombre)}`;
}

function renderProducts(container, products) {
  if (!container) {
    console.error('Contenedor de productos no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  if (!products || Object.keys(products).length === 0) {
    container.innerHTML = '<p>No hay productos disponibles</p>';
    return;
  }
  
  Object.entries(products).forEach(([nombre, datos]) => {
    const productCard = document.createElement('div');
    productCard.className = 'shoe';
    productCard.innerHTML = `
      <img src="${datos.img}" alt="${nombre}">
      <h3 class="shoe-name">${nombre}</h3>
      <p class="price">$${datos.precio.toLocaleString('es-AR')}</p>
      <button class="add-cart">
        <i class="fas fa-shopping-cart"></i>
      </button>
    `;
    
    productCard.addEventListener('click', () => verDetalle(nombre));
    
    const cartBtn = productCard.querySelector('.add-cart');
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart({
        nombre: nombre,
        precio: datos.precio,
        talle: "Sin seleccionar",
        imagen: datos.img
      });
    });
    
    container.appendChild(productCard);
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalDisplay = document.getElementById('total-price');
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío.</p>";
    if (totalDisplay) totalDisplay.textContent = '';
    return;
  }
  
  container.innerHTML = '';
  let total = 0;
  
  cart.forEach((producto, index) => {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="cart-img">
      <div class="cart-info">
        <h3>${producto.nombre}</h3>
        <p>Talle: ${producto.talle}</p>
      </div>
      <div class="cart-actions">
        <p class="cart-item-price">$${producto.precio.toLocaleString('es-AR')}</p>
        <button class="btn-eliminar" data-index="${index}">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
    `;
    
    const deleteBtn = item.querySelector('.btn-eliminar');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemIndex = parseInt(e.currentTarget.dataset.index);
      removeFromCart(itemIndex);
    });
    
    container.appendChild(item);
    total += producto.precio;
  });
  
  if (totalDisplay) {
    totalDisplay.innerHTML = `<strong>Total:</strong> <span class="cart-total-price">$${total.toLocaleString('es-AR')}</span>`;
  }
}

// --------------------
// SISTEMA DE COMPRA CON MERCADO PAGO
// --------------------
function initCheckout() {
  const compraActual = JSON.parse(localStorage.getItem('compraActual')) || [];
  const checkoutResume = document.getElementById('checkout-resume');
  
  if (compraActual.length === 0) {
    checkoutResume.innerHTML = '<p>No hay productos en esta compra. <a href="index.html">Volver a la tienda</a></p>';
    return;
  }
  
  let total = 0;
  let html = '<div class="checkout-items">';
  
  compraActual.forEach(item => {
    html += `
      <div class="checkout-item">
        <img src="${item.imagen}" alt="${item.nombre}" width="50">
        <div>
          <h3>${item.nombre}</h3>
          <p>Talle: ${item.talle}</p>
          <p>Precio: $${item.precio.toLocaleString('es-AR')}</p>
        </div>
      </div>
    `;
    total += item.precio;
  });
  
  html += `</div><p class="checkout-total">Total: <strong>$${total.toLocaleString('es-AR')}</strong></p>`;
  checkoutResume.innerHTML = html;
  
  // Guardar el total para mostrarlo en success.html
  localStorage.setItem('totalCompra', total);
  
  // Procesar compra con Mercado Pago
  const checkoutForm = document.getElementById('checkout-form');
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const metodoPago = document.querySelector('input[name="pago"]:checked').value;
    
    // Guardar datos de envío para mostrar en success.html
    const datosEnvio = {
      nombre,
      direccion,
      email,
      telefono,
      metodoPago
    };
    localStorage.setItem('datosEnvio', JSON.stringify(datosEnvio));
    
    // Si es pago en efectivo, procesar localmente
    if (metodoPago === 'efectivo') {
      alert('¡Compra realizada con éxito! Pagarás en efectivo al recibir tu pedido.');
      finalizarCompra();
      return;
    }
    
    // Si es tarjeta, usar Mercado Pago
    try {
      // Crear preferencia de pago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TEST-178649999822958-062308-de1c8cfc56c089888fab3c4fbeac7372-294447407'
        },
        body: JSON.stringify({
          items: compraActual.map(item => ({
            title: item.nombre,
            unit_price: item.precio,
            quantity: 1,
            description: `Talle: ${item.talle}`
          })),
          payer: {
            name: nombre,
            email: email,
            phone: {
              number: telefono
            },
            address: {
              street_name: direccion
            }
          },
          back_urls: {
            success: "http://127.0.0.1:5500/success.html",
            failure: "http://127.0.0.1:5500/failure.html",
            pending: "http://127.0.0.1:5500/pending.html"
          },
          statement_descriptor: "ORBITA STORE"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
      }
      
      const preference = await response.json();
      
      // Abrir checkout de Mercado Pago
      const mp = new MercadoPago('TEST-7a53d5f6-f6cd-4703-a7c9-e4e17beb9364', {
        locale: 'es-AR'
      });
      
      mp.checkout({
        preference: {
          id: preference.id
        },
        autoOpen: true
      });
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert(`Ocurrió un error al procesar el pago: ${error.message}. Por favor, inténtalo de nuevo.`);
    }
  });
  
  // Función para finalizar compra (común para ambos métodos)
  function finalizarCompra() {
    // Vaciar carrito
    localStorage.removeItem('carrito');
    localStorage.removeItem('compraActual');
    cart = [];
    updateCartCount();
    
    // Guardar última orden para mostrar en success.html
    localStorage.setItem('ultimaOrden', JSON.stringify({
      productos: compraActual,
      total: total
    }));
    
    // Redirigir a página de éxito
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 1000);
  }
}

// Funcion para inicializar estrellas
function createStars() {
  const starsContainer = document.getElementById('stars');
  const starsCount = 200;
  
  for (let i = 0; i < starsCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Posición aleatoria
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Tamaño aleatorio (entre 1px y 3px)
    const size = Math.random() * 2 + 1;
    
    // Duración de animación aleatoria
    const duration = Math.random() * 5 + 3;
    
    // Opacidad aleatoria
    const opacity = Math.random() * 0.5 + 0.3;
    
    star.style.left = `${posX}%`;
    star.style.top = `${posY}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--duration', `${duration}s`);
    star.style.setProperty('--opacity', opacity);
    
    starsContainer.appendChild(star);
  }
}

// --------------------
// MOSTRAR RESUMEN DE COMPRA (SUCCESS PAGE)
// --------------------
function mostrarResumenCompra() {
  const resumenContainer = document.getElementById('resumen-compra');
  
  // Obtener datos guardados
  const ultimaOrden = JSON.parse(localStorage.getItem('ultimaOrden'));
  const datosEnvio = JSON.parse(localStorage.getItem('datosEnvio'));
  
  if (!ultimaOrden || !datosEnvio) {
    resumenContainer.innerHTML = '<p>No se encontraron datos de la compra.</p>';
    return;
  }
  
  let html = `
    <h2><i class="fas fa-shopping-bag"></i> Resumen de tu compra</h2>
    <div class="productos-comprados">
      <ul>
  `;
  
  // Productos comprados
  ultimaOrden.productos.forEach(producto => {
    html += `
        <li>
          <span>${producto.nombre} (Talle: ${producto.talle})</span>
          <span>$${producto.precio.toLocaleString('es-AR')}</span>
        </li>
    `;
  });
  
  html += `
      </ul>
    </div>
    <div class="resumen-total">
      <span class="monto-total">$${ultimaOrden.total.toLocaleString('es-AR')}</span>
    </div>
    <div class="datos-envio">
      <h3><i class="fas fa-truck"></i> Datos de envío</h3>
      <p><strong>Nombre:</strong> ${datosEnvio.nombre}</p>
      <p><strong>Dirección:</strong> ${datosEnvio.direccion}</p>
      <p><strong>Teléfono:</strong> ${datosEnvio.telefono}</p>
      <p><strong>Email:</strong> ${datosEnvio.email}</p>
      <p><strong>Método de pago:</strong> ${datosEnvio.metodoPago === 'tarjeta' ? 'Tarjeta (Mercado Pago)' : 'Efectivo'}</p>
    </div>
  `;
  
  resumenContainer.innerHTML = html;
}


//---------------------
// INICIALIZACIÓN
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Renderizar productos en la página principal
  const productsContainer = document.querySelector('.products-container');
  if (productsContainer) {
    renderProducts(productsContainer, zapatillas);
  }
  
  // Renderizar carrito
  renderCartItems();
  updateCartCount();
  
  // Vaciar carrito
  document.getElementById('vaciar-carrito')?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      clearCart();
    }
  });
  
  // Botón para comprar todo el carrito
  document.getElementById('comprar-todo')?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    // Guardar todo el carrito como compra actual
    localStorage.setItem('compraActual', JSON.stringify(cart));
    window.location.href = 'checkout.html';
  });
  
  // Scroll suave
  document.querySelector('.scroll-down')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#catalog').scrollIntoView({
      behavior: 'smooth'
    });
  });
  
  // Lógica de detalle de producto
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get('nombre');
  
  if (nombre && zapatillas[nombre]) {
    const zap = zapatillas[nombre];
    
    if (document.getElementById('detalle-img')) {
      document.getElementById('detalle-img').src = zap.img;
      document.getElementById('detalle-nombre').textContent = nombre;
      document.getElementById('detalle-precio').textContent = `$${zap.precio.toLocaleString('es-AR')}`;
      document.getElementById('detalle-descripcion').textContent = zap.descripcion;
    }
    
    // Talles disponibles
    const tallesContainer = document.querySelector('.talles');
    if (tallesContainer) {
      tallesContainer.innerHTML = "";
      
      zap.talles.forEach(talle => {
        const btn = document.createElement('button');
        btn.className = "talle-btn";
        btn.textContent = talle;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        tallesContainer.appendChild(btn);
      });
    }
    
    // Botones de acción
    document.getElementById('btn-agregar-carrito')?.addEventListener('click', () => {
      const talleSeleccionado = document.querySelector('.talle-btn.selected');
      if (!talleSeleccionado) {
        alert('Por favor selecciona un talle antes de agregar al carrito.');
        return;
      }
      
      const talle = talleSeleccionado.textContent;
      addToCart({
        nombre: nombre,
        precio: zap.precio,
        talle: talle,
        imagen: zap.img
      });
    });
    
    document.getElementById('btn-comprar-ahora')?.addEventListener('click', () => {
      const talleSeleccionado = document.querySelector('.talle-btn.selected');
      if (!talleSeleccionado) {
        alert('Por favor selecciona un talle antes de comprar.');
        return;
      }
      
      const talle = talleSeleccionado.textContent;
      
      // Guardar compra individual
      localStorage.setItem('compraActual', JSON.stringify([{
        nombre: nombre,
        precio: zap.precio,
        talle: talle,
        imagen: zap.img
      }]));
      
      window.location.href = 'checkout.html';
    });
    
    // Productos relacionados
    const relacionadosContainer = document.querySelector('.relacionados-lista');
    if (relacionadosContainer) {
      const relacionados = Object.keys(zapatillas)
        .filter(name => name !== nombre)
        .slice(0, 3);
      
      // Crear objeto con productos relacionados
      const productosRelacionados = {};
      relacionados.forEach(name => {
        productosRelacionados[name] = zapatillas[name];
      });
      
      renderProducts(relacionadosContainer, productosRelacionados);
    }
  }
  
  // Inicializar checkout si estamos en esa página
  if (window.location.pathname.includes('checkout.html')) {
    // Cargar SDK Mercado Pago dinámicamente
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      // Una vez cargado el SDK, inicializar checkout
      initCheckout();
    };
    document.head.appendChild(script);
  }
  
  // Configuración de partículas (asegurar que se vean detrás de todo)
  if (document.getElementById('particles-js')) {
    particlesJS("particles-js", {
      particles: {
        number: { value: 300, density: { enable: true, value_area: 800 } },
        color: { value: "#8804f5" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        move: { enable: true, speed: 1 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: "repulse" } }
      },
      retina_detect: true
    });
  }
  
  // Inicializar página de éxito
  if (window.location.pathname.includes('success.html')) {
    // Crear estrellas en el fondo
    createStars();
    
    // Actualizar contador del carrito (a 0)
    updateCartCount();
    
    // Mostrar resumen de la compra
    mostrarResumenCompra();
  }
});