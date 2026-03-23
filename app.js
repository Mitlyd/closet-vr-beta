// =============================================
// CLOSET VR (app.js)
// =============================================

const API_URL = "/api";
let currentUser = null;
let streamGlobal = null;

// =============================================
// INICIALIZACIÓN
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("Closet VR Listo.");
});

// =============================================
// AUTENTICACIÓN
// =============================================

function toggleAuth() {
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    loginBox.style.display = (loginBox.style.display === "none") ? "block" : "none";
    registerBox.style.display = (registerBox.style.display === "none") ? "block" : "none";
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';
    document.getElementById('user-name-display').textContent = `Hola, ${currentUser.nombre}`;
    loadPrendas();
    actualizarContadorCarrito();
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return alert("Llena todos los campos, vv.");

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            currentUser = { id: data.id, nombre: data.nombre };
            showMainApp();
        } else {
            throw new Error(data.message || "Credenciales incorrectas.");
        }
    } catch (error) {
        alert("Login fallido: " + error.message);
    }
}



async function register() {
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!nombre || !email || !password) return alert("Llena todos los campos para el registro, vv.");

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await response.json();
        
        if (response.ok && data.status === "success") {
            alert("✨ ¡Registro exitoso! Ya puedes iniciar sesión.");
            toggleAuth(); // Te regresa al cuadro de Login
        } else {
            throw new Error(data.message || "Error al registrar usuario.");
        }
    } catch (error) {
        alert("Registro fallido: " + error.message);
    }
}

// =============================================
// NAVEGACIÓN Y CARGA
// =============================================

async function loadPageContent(page) {
    if (page === 'favoritos') await verMisFavoritos();
    else if (page === 'carrito') await verMiCarrito();
    else if (page === 'inicio') await loadPrendas();
}

async function loadPrendas() {
    const container = document.getElementById('catalog-container');
    const title = document.getElementById('section-title');
    container.innerHTML = '<p class="loading-msg">Cargando moda VR...</p>';
    title.textContent = "Catálogo Completo";

    try {
        const response = await fetch(`${API_URL}/prendas`);
        const prendas = await response.json();
        container.innerHTML = '';

        prendas.forEach(p => {
            container.innerHTML += `
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${p.imagen}" alt="${p.nombre}">
                    </div>
                    <div class="product-info">
                        <h3>${p.nombre}</h3>
                        <p>${p.descripcion}</p>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="addToCart(${p.id})">
                                <i class="fa fa-shopping-cart"></i> Agregar
                            </button>
                            <button class="btn-add-fav" onclick="addToFav(${p.id})">
                                <i class="fa fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) {
        container.innerHTML = '<p class="error-msg">Error conectando con el servidor.</p>';
    }
}

// =============================================
// VISTAS ESPECÍFICAS
// =============================================

async function verMiCarrito() {
    if (!currentUser) return alert("Inicia sesión, vv.");
    const container = document.getElementById('catalog-container');
    document.getElementById('section-title').textContent = "Mi Carrito 🛒";
    
    try {
        const response = await fetch(`${API_URL}/ver-carrito/${currentUser.id}`);
        const productos = await response.json();
        renderMiniCards(productos, container, 'carrito');
    } catch (e) { alert("Error al ver carrito"); }
}

async function verMisFavoritos() {
    if (!currentUser) return alert("Inicia sesión, vv.");
    const container = document.getElementById('catalog-container');
    document.getElementById('section-title').textContent = "Mis Favoritos ❤️";
    
    try {
        const response = await fetch(`${API_URL}/ver-favoritos/${currentUser.id}`);
        const productos = await response.json();
        renderMiniCards(productos, container, 'favoritos');
    } catch (e) { alert("Error al ver favoritos"); }
}

function renderMiniCards(productos, container, tipo) {
    container.innerHTML = '';
    if (!productos || productos.length === 0) {
        container.innerHTML = '<p class="loading-msg">Está vacío por ahora, vv. ✨</p>';
        return;
    }
    
    productos.forEach(p => {
        const funcionEliminar = (tipo === 'favoritos') ? `removeFromFav(${p.id})` : `removeFromCart(${p.id})`;
        const textoBoton = (tipo === 'favoritos') ? "Quitar de Fav" : "Quitar del Carrito";

        container.innerHTML += `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${p.imagen}" alt="${p.nombre}">
                </div>
                <div class="product-info">
                    <h3>${p.nombre}</h3>
                    <p>${p.descripcion}</p>
                    <button class="btn-remove" onclick="${funcionEliminar}">
                        <i class="fa fa-trash"></i> ${textoBoton}
                    </button>
                </div>
            </div>`;
    });
}

// =============================================
// ACCIONES (API CALLS)
// =============================================

async function addToCart(prendaId) {
    if (!currentUser) return alert("¡Oye! Inicia sesión.");
    try {
        await fetch(`${API_URL}/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: currentUser.id, prenda_id: prendaId })
        });
        alert("✨ ¡Añadido al carrito!");
        actualizarContadorCarrito();
    } catch (error) { alert("Error al añadir"); }
}

async function addToFav(prendaId) {
    if (!currentUser) return alert("¡Pilas! Inicia sesión.");
    try {
        await fetch(`${API_URL}/favoritos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: currentUser.id, prenda_id: prendaId })
        });
        alert("💖 ¡Guardado en favoritos!");
    } catch (error) { alert("Error al guardar"); }
}

async function removeFromCart(prendaId) {
    try {
        await fetch(`${API_URL}/carrito/eliminar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: currentUser.id, prenda_id: prendaId })
        });
        verMiCarrito();
        actualizarContadorCarrito();
    } catch (e) { alert("Error al eliminar"); }
}

async function removeFromFav(prendaId) {
    try {
        await fetch(`${API_URL}/favoritos/eliminar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: currentUser.id, prenda_id: prendaId })
        });
        verMisFavoritos();
    } catch (e) { alert("Error al eliminar fav"); }
}

async function actualizarContadorCarrito() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/carrito/contar/${currentUser.id}`);
        const data = await response.json();
        const cartIcon = document.querySelector('a[onclick*="carrito"]');
        let badge = document.getElementById('cart-badge');
        
        if (!badge && cartIcon) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            badge.style = "background: red; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; position: absolute; margin-left: -10px; margin-top: -5px;";
            cartIcon.appendChild(badge);
        }
        
        if (badge) {
            badge.textContent = data.count > 0 ? data.count : '';
            badge.style.display = data.count > 0 ? 'inline' : 'none';
        }
    } catch (e) { console.log("Error en contador"); }
}

function logout() {
    currentUser = null;
    window.location.reload(); 
}

async function abrirCamara() {
    if (!currentUser) return alert("¡Oye, vv! Inicia sesión para usar el probador.");

    //  Ocultamos el catálogo y mostramos la sección de la cámara
    document.getElementById('catalog-container').style.display = 'none';
    document.getElementById('section-title').style.display = 'none'; // Ocultamos el título "Catálogo"
    document.getElementById('camera-section').style.display = 'block';

    const video = document.getElementById('video');

    // Pedimos permiso al navegador para usar la cámara
    try {
        // 'getUserMedia' es la API  que enciende la cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, // Resolución sugerida
            audio: false // No necesitamos micrófono
        });
        
        //  Guardamos el 'stream' y lo ponemos en el elemento <video>
        streamGlobal = stream;
        video.srcObject = stream;
        video.play();
        console.log("Cámara encendida con éxito, vv. ✨");

    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        alert("¡Uff! No pude encender la cámara. Asegúrate de dar permisos en el candadito de la URL, vv. 🔒");
        cerrarCamara(); // Volvemos al catálogo
    }
}

function cerrarCamara() {
    // Apagamos la cámara si está encendida
    if (streamGlobal) {
        streamGlobal.getTracks().forEach(track => track.stop()); // Detenemos el video
        streamGlobal = null;
    }

    const video = document.getElementById('video');
    video.srcObject = null; // Limpiamos el video

    // 2. Volvemos a mostrar el catálogo
    document.getElementById('camera-section').style.display = 'none';
    document.getElementById('catalog-container').style.display = 'grid'; // O como lo tengas en CSS
    document.getElementById('section-title').style.display = 'block';
    loadPrendas(); // Recargamos las prendas por seguridad
}
