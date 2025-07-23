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
// GESTIÓN DEL CARRITO (VERSIÓN CORREGIDA)
// --------------------
let cart = JSON.parse(localStorage.getItem("carrito")) || [];

function saveCart() {
  localStorage.setItem("carrito", JSON.stringify(cart));
  updateCartCount();
  renderCartItems(); // Añadido para actualizar la vista del carrito
}

function addToCart(producto) {
  // Buscar si el producto con mismo nombre y talle ya existe en el carrito
  const index = cart.findIndex(item => 
    item.nombre === producto.nombre && item.talle === producto.talle);
  
  if (index !== -1) {
    // Si ya existe, incrementar la cantidad
    cart[index].cantidad = (cart[index].cantidad || 1) + 1;
  } else {
    // Si no existe, agregar nuevo producto con cantidad 1
    cart.push({
      ...producto,
      cantidad: 1
    });
  }
  
  saveCart();
  showToastNotification(`${producto.nombre} (Talle: ${producto.talle}) fue agregado al carrito`);
}

function showToastNotification(message) {
  // Crear elemento de notificación
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  // Añadir al body
  document.body.appendChild(toast);
  
  // Mostrar
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    // Eliminar después de la animación
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart();
  }
}

function clearCart() {
  // Animación al vaciar el carrito
  const cartItems = document.querySelectorAll('.cart-item');
  cartItems.forEach(item => {
    item.style.transform = 'translateX(-100%)';
    item.style.opacity = '0';
    item.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  });
  
  // Vaciar después de la animación
  setTimeout(() => {
    cart = [];
    saveCart();
    renderCartItems();
  }, 300);
}

function calculateTotal() {
  return cart.reduce((total, item) => total + (item.precio * (item.cantidad || 1)), 0);
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + (item.cantidad || 1), 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = totalItems;
  });
}

// --------------------
// FUNCIONES GENERALES (VERSIÓN MEJORADA)
// --------------------
function verDetalle(nombre) {
  window.location.href = `detalle.html?nombre=${encodeURIComponent(nombre)}`;
}

function renderProducts(container, products) {
  if (!container) return;
  
  container.innerHTML = Object.keys(products).length === 0 
    ? '<p>No hay productos disponibles</p>'
    : Object.entries(products).map(([nombre, datos]) => `
        <div class="shoe" onclick="verDetalle('${nombre}')">
          <img src="${datos.img}" alt="${nombre}">
          <h3 class="shoe-name">${nombre}</h3>
          <p class="price">$${datos.precio.toLocaleString('es-AR')}</p>
        </div>
      `).join('');
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
  
  // Agrupar items por nombre y talle
  const groupedItems = cart.reduce((acc, item, index) => {
    const key = `${item.nombre}-${item.talle}`;
    if (!acc[key]) {
      acc[key] = {
        ...item,
        indices: [index]
      };
    } else {
      acc[key].cantidad += item.cantidad;
      acc[key].indices.push(index);
    }
    return acc;
  }, {});

  container.innerHTML = Object.values(groupedItems).map(item => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}" class="cart-img">
      <div class="cart-info">
        <h3>${item.nombre}</h3>
        <p>Talle: ${item.talle} x${item.cantidad}</p>
      </div>
      <div class="cart-actions">
        <p class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
        <button class="btn-eliminar" onclick="removeGroupedItems(${JSON.stringify(item.indices)})">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
    </div>
  `).join('');

  if (totalDisplay) {
    totalDisplay.innerHTML = `<strong>Total:</strong> <span class="cart-total-price">$${calculateTotal().toLocaleString('es-AR')}</span>`;
  }
}

function removeGroupedItems(indices) {
  // Eliminar en orden descendente para no afectar los índices
  indices.sort((a, b) => b - a).forEach(i => removeFromCart(i));
}

// Función para mostrar modal de confirmación
function showConfirmationModal(message, onConfirm) {
  // Crear el modal si no existe
  let modal = document.getElementById('confirmation-modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title"><i class="fas fa-exclamation-circle"></i> Confirmar acción</h3>
        <p class="modal-message">${message}</p>
        <div class="modal-buttons">
          <button class="modal-btn modal-btn-cancel">Cancelar</button>
          <button class="modal-btn modal-btn-confirm">Aceptar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Manejar clic en cancelar
    modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
      hideConfirmationModal();
    });
    
    // Manejar clic en confirmar
    modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
      onConfirm();
      hideConfirmationModal();
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideConfirmationModal();
      }
    });
  } else {
    // Actualizar mensaje si el modal ya existe
    modal.querySelector('.modal-message').textContent = message;
    // Reemplazar el evento de confirmación
    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
      onConfirm();
      hideConfirmationModal();
    });
  }
  
  // Mostrar el modal
  setTimeout(() => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }, 10);
}

// Función para ocultar el modal
function hideConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      document.body.style.overflow = ''; // Restaurar scroll
    }, 300);
  }
}



// --------------------
// SISTEMA DE COMPRA (VERSIÓN MEJORADA)
// --------------------
function initCheckout(productosDirectos = null) {
  let productosCheckout = [];
  let total = 0;

  if (productosDirectos) {
    // Modo "Comprar ahora" - productos directos
    productosCheckout = Array.isArray(productosDirectos) ? productosDirectos : [productosDirectos];
    total = productosCheckout.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
  } else {
    // Modo normal - todo el carrito
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    productosCheckout = [...cart];
    total = calculateTotal();
  }

  // Guardar la compra para mostrar en success.html
  localStorage.setItem('ultimaOrden', JSON.stringify({
    productos: productosCheckout,
    total: total,
    fecha: new Date().toISOString()
  }));

  // Redirigir a la página de éxito
  window.location.href = 'success.html';
}

// --------------------
// MOSTRAR RESUMEN DE COMPRA (VERSIÓN MEJORADA)
// --------------------
function mostrarResumenCompra() {
  const resumenContainer = document.getElementById('resumen-compra');
  const ultimaOrden = JSON.parse(localStorage.getItem('ultimaOrden'));
  
  if (!ultimaOrden) {
    resumenContainer.innerHTML = '<p>No se encontraron datos de la compra.</p>';
    return;
  }
  
  // Agrupar productos para el resumen
  const productosAgrupados = ultimaOrden.productos.reduce((acc, item) => {
    const key = `${item.nombre}-${item.talle}`;
    if (!acc[key]) {
      acc[key] = {
        ...item,
        cantidad: 0,
        subtotal: 0
      };
    }
    acc[key].cantidad += item.cantidad || 1;
    acc[key].subtotal += item.precio * (item.cantidad || 1);
    return acc;
  }, {});

  resumenContainer.innerHTML = `
    <div class="resumen-compra-detalle">
      <h2><i class="fas fa-shopping-bag"></i> Resumen de tu pedido</h2>
      <div class="productos-comprados">
        <ul>
          ${Object.values(productosAgrupados).map(item => `
            <li>
              <span>${item.nombre} (Talle: ${item.talle}) x${item.cantidad}</span>
              <span>$${item.subtotal.toLocaleString('es-AR')}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="resumen-total">
        <span>Total:</span>
        <span class="monto-total">$${ultimaOrden.total.toLocaleString('es-AR')}</span>
      </div>
    </div>
    <div class="instrucciones-pago">
      <h3><i class="fas fa-info-circle"></i> Instrucciones para completar tu compra:</h3>
      <ol>
        <li>Envía una captura de este resumen al número de WhatsApp que aparece abajo</li>
        <li>Indica tu nombre completo y dirección de envío</li>
        <li>Te enviaremos los datos para el pago (transferencia o efectivo)</li>
        <li>Una vez confirmado el pago, prepararemos tu pedido</li>
      </ol>
      <a href="https://wa.me/5492494625738?text=${encodeURIComponent(
        `¡Hola Órbita! \n\nQuiero confirmar mi compra:\n\n` +
        ` *Detalle del pedido:*\n` +
        `${Object.values(productosAgrupados)
          .map(p => ` ${p.nombre}\n   • Talle: ${p.talle}\n   • Cantidad: ${p.cantidad}\n   • Subtotal: $${p.subtotal.toLocaleString('es-AR')}`)
          .join('\n')}\n\n` +
        `*Total:* $${ultimaOrden.total.toLocaleString('es-AR')}\n\n` +
        `Mis datos:\n` +
        `• Nombre completo: \n` +
        `• Direccion de envio: \n` +
        `• Localidad: \n` +
        `• Código postal: \n` +
        `• Método de pago: \n\n` +
        `¡Gracias!`
      )}" class="whatsapp-btn" target="_blank">
      <i class="fab fa-whatsapp"></i> Enviar comprobante por WhatsApp
      </a>
    </div>
  `;
  
  // Limpiar solo si fue una compra desde el carrito
  if (!ultimaOrden.productos.some(p => p.directPurchase)) {
    cart = [];
    localStorage.removeItem('carrito');
    updateCartCount();
  }
}

// --------------------
// INICIALIZACIÓN (VERSIÓN MEJORADA)
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Renderizar productos
  const productsContainer = document.querySelector('.products-container');
  if (productsContainer) renderProducts(productsContainer, zapatillas);
  
  // Inicializar carrito
  renderCartItems();
  updateCartCount();
  
  // Event listeners
  document.getElementById('vaciar-carrito')?.addEventListener('click', () => {
  if (cart.length === 0) {
    showToastNotification('El carrito ya está vacío');
    return;
  }

  // Scroll suave
  document.querySelector('.scroll-down')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#catalog').scrollIntoView({
      behavior: 'smooth'
    });
  });
  
  showConfirmationModal(
    '¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.',
    () => {
      clearCart();
      showToastNotification('El carrito se ha vaciado correctamente');
    }
  );
  });
  
  document.getElementById('comprar-todo')?.addEventListener('click', () => initCheckout());
  
  // Lógica de detalle de producto
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get('nombre');
  
  if (nombre && zapatillas[nombre] && document.getElementById('detalle-img')) {
    const zap = zapatillas[nombre];
    
    document.getElementById('detalle-img').src = zap.img;
    document.getElementById('detalle-nombre').textContent = nombre;
    document.getElementById('detalle-precio').textContent = `$${zap.precio.toLocaleString('es-AR')}`;
    document.getElementById('detalle-descripcion').textContent = zap.descripcion;
    
    // Talles disponibles
    const tallesContainer = document.querySelector('.talles');
    if (tallesContainer) {
      tallesContainer.innerHTML = zap.talles.map(talle => `
        <button class="talle-btn" onclick="document.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('selected')); this.classList.add('selected')">
          ${talle}
        </button>
      `).join('');
    }
    
    // Botones de acción
    document.getElementById('btn-agregar-carrito')?.addEventListener('click', () => {
      const talleSeleccionado = document.querySelector('.talle-btn.selected');
      if (!talleSeleccionado) return alert('Por favor selecciona un talle');
      
      addToCart({
        nombre: nombre,
        precio: zap.precio,
        talle: talleSeleccionado.textContent,
        imagen: zap.img
      });
    });
    
    document.getElementById('btn-comprar-ahora')?.addEventListener('click', () => {
      const talleSeleccionado = document.querySelector('.talle-btn.selected');
      if (!talleSeleccionado) return alert('Por favor selecciona un talle');
      
      // Crear producto para compra directa (sin pasar por el carrito)
      const productoDirecto = {
        nombre: nombre,
        precio: zap.precio,
        talle: talleSeleccionado.textContent,
        imagen: zap.img,
        cantidad: 1,
        directPurchase: true // Marcar como compra directa
      };
      
      initCheckout(productoDirecto);
    });
    
    // Productos relacionados
    const relacionadosContainer = document.querySelector('.relacionados-lista');
    if (relacionadosContainer) {
      const relacionados = Object.keys(zapatillas)
        .filter(name => name !== nombre)
        .slice(0, 3)
        .reduce((acc, name) => ({ ...acc, [name]: zapatillas[name] }), {});
      
      renderProducts(relacionadosContainer, relacionados);
    }
  }
  
  // Página de éxito
  if (window.location.pathname.includes('success.html')) {
    createStars();
    updateCartCount();
    mostrarResumenCompra();
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
});

// Función para estrellas
function createStars() {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  
  starsContainer.innerHTML = Array.from({ length: 200 }, () => {
    const size = Math.random() * 2 + 1;
    return `
      <div class="star" style="
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        --duration: ${Math.random() * 5 + 3}s;
        --opacity: ${Math.random() * 0.5 + 0.3};
      "></div>
    `;
  }).join('');
}

