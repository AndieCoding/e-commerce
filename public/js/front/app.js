import { Card } from '../components/products/card.js';
import { Categoria } from '../components/index/categoria.js';
import { Filtros } from '../components/products/filtros.js';
import { User } from "../models/user.js";
import { UserTools } from '../components/user/user-tools.js';

window.indexProducts = async function indexProducts() {
    const cardsContainer = document.querySelector('#destacados');
    if (!cardsContainer) return;
    mostrarSkeletons(cardsContainer, 6);
    const response = await fetch('/api/indexProducts');
    const data = await response.json();
    cardsContainer.innerHTML = '';
    data.forEach(product => { crearCards(cardsContainer, product); });
}

window.consultarProductos = async function consultarProductos(categoria, query) {
    const contenedor = document.querySelector('.resultados');
    if (!contenedor) return;
    mostrarSkeletons(contenedor, 8);
    try {
        let url = query
            ? `/api/products/search/${encodeURIComponent(query)}`
            : `/api/products/${categoria.replace('s', '')}`
        const response = await fetch(url);
        const data = await response.json();

        contenedor.innerHTML = '';
        if (data.products && data.products.length > 0) {
            data.products.forEach(p => {
                crearCards(contenedor, p);
            });
            return;
        } else {
            contenedor.innerHTML = '<p>No se encontraron productos</p>';
            return;
        }
    } catch (error) {
        console.error("Error en el servidor: ", error);
        contenedor.innerHTML = '<p>Error de conexión. Reintente más tarde</p>';
    }
}

if (!window.user) {
    window.user = new User();
}
let verificandoActualmente = false;
window.checkAuth = async function checkAuth(force = false) {
    if (verificandoActualmente) return;

    const ahora = Date.now();
    const cinco_minutos = 5 * 60 * 1000;
    const lastCheck = localStorage.getItem('lastAuthCheck');

    if (!force && lastCheck && ahora - lastCheck < cinco_minutos) {
        console.log("Sesión validada por cache (reciente)");
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: JSON.parse(localStorage.getItem('user')) }));
        window.user = JSON.parse(localStorage.getItem('user'));
        return true;
    }
    verificandoActualmente = true;

    try {
        const response = await fetch('/api/me');
        const auth = await response.json();
        if (auth.logged) {
            window.user = auth.user;
            localStorage.setItem('user', JSON.stringify(auth.user));
            localStorage.setItem('lastAuthCheck', ahora);
        } else {
            window.user = null;
            localStorage.removeItem('user');
            localStorage.removeItem('lastAuthCheck');
        }
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: window.user }));

        return auth.logged;
    } catch (error) {
        console.error("Error al verificar sesión:", error);
    } finally {
        verificandoActualmente = false;
    }
}

await checkAuth();

if (!window.appListenersAttached) {
    document.addEventListener('turbo:load', async () => {
        const path = window.location.pathname;
        if (path.startsWith('/panel') || path.startsWith('/mis_datos')) {
            await checkAuth();
        }

        const cardsContainer = document.querySelector('#destacados');
        if (cardsContainer) {
            indexProducts();
        }

        const contenedorResultados = document.querySelector('.resultados');
        if (contenedorResultados) {
            cargarProductos();
        }

        const quickLinksContainer = document.querySelector('.quick-links-mobile');
        if (quickLinksContainer) {
            if (!document.querySelector('#link-panel')) {
                cargarPanelUsuario(quickLinksContainer);
            }
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                cerrarSesion(logoutBtn)
            }
        }

        const misDatosLink = document.querySelector('#link-mis-datos .icon');
        if (misDatosLink) {
            cargarFotoPerfil(misDatosLink);
        }

        const misDatosContainer = document.getElementById('mis-datos-container');
        if (misDatosContainer) {
            cargarMiFoto();
            cargarMisDatos();
        }

    })

    window.addEventListener('userUpdated', (event) => {
        let foto = event.detail.FOTO;
        const $previewImage = document.querySelector('#previewImage');
        if ($previewImage) {
            if (foto && foto !== null) {
                $previewImage.style.backgroundImage = `url(${foto})`;
            } else {
                $previewImage.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
            }
        }
    });

    document.addEventListener("turbo:before-visit", (event) => {
        const urlDestino = event.detail.url;
        const rutasProtegidas = ['/user_menu', '/mis_datos', '/mis_compras', '/panel', 'altas', 'administrar'];
        const esRutaProtegida = rutasProtegidas.some(ruta => urlDestino.startsWith(ruta));

        if (esRutaProtegida) {
            const logueado = checkAuth(true);
            console.log(`Navegando a: ${urlDestino} | Protegida: ${esRutaProtegida} | Login: ${logueado}`);
            if (!logueado) {
                event.preventDefault();
                console.warn("Acceso denegado: Redirigiendo a login");
                Turbo.visit("/login", { action: "replace" });
            }
            else {
                checkAuth(false);
            }
        }
    });


    document.addEventListener('click', (e) => {

        if (e.target.closest('#boton-filtro')) {
            const filtros = document.querySelector('.filtros');
            if (filtros) {
                filtros.classList.toggle('mostrar');
            }
        }

        if (e.target.closest('#grid')) {
            const resultados = document.querySelector('.resultados');
            if (resultados) {
                resultados.classList.replace('list', 'grid');
                document.querySelectorAll('product-card').forEach(card => card.setAttribute('tipo', 'grid'));
            }
        }

        if (e.target.closest('#list')) {
            const resultados = document.querySelector('.resultados');
            if (resultados) {
                resultados.classList.replace('grid', 'list');
                document.querySelectorAll('product-card').forEach(card => card.setAttribute('tipo', 'list'));
            }
        }

        if (e.target.closest('.back-arrow')) {
            window.history.back();
        }
    });

    window.appListenersAttached = true;
}

function mostrarSkeletons(container, cantidad) {
    const skeletonsHTML = Array(cantidad).fill(`
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-price"></div>
        </div>
    `).join('');

    container.innerHTML = skeletonsHTML;
}

function crearCards(container, producto) {
    const card = document.createElement('product-card');
    const imagenOptimizada = producto.P_IMG.includes('cloudinary')
        ? producto.P_IMG.replace('/upload/', '/upload/w_400,c_fill,f_auto,q_auto/')
        : producto.P_IMG;
    card.setAttribute('id', producto.ID_PROD);
    card.setAttribute('image', imagenOptimizada);
    card.setAttribute('name', producto.P_NOMBRE);
    card.setAttribute('price', producto.P_PRECIO);
    card.setAttribute('oferta', producto.P_PR_OFERTA || 0);
    card.setAttribute('marca', producto.P_MARCA);
    card.setAttribute('stock', producto.P_CANTIDAD);
    if (document.querySelector('.resultados')) {
        if (document.querySelector('.resultados').classList.contains('grid')) {
            card.setAttribute('tipo', 'grid');
        } else {
            card.setAttribute('tipo', 'list');
        }
    }
    card.classList.add('fade-in-card');
    container.appendChild(card);
}

function cargarProductos() {
    let categoria = localStorage.getItem('categoria') || 'mates';
    const query = localStorage.getItem('query');

    if (!categoria || categoria === 'undefined' || categoria === 'null') {
        categoria = 'mates';
        localStorage.setItem('categoria', 'mates');
    }
    console.log('categoria: ', categoria);
    console.log('query: ', query);
    if (categoria === 'busqueda' && query) {
        window.consultarProductos(null, query);
    } else {
        window.consultarProductos(categoria);
    }
}

function cargarPanelUsuario(quickLinksContainer) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.TIPO === 'ad') {

        if (quickLinksContainer) {
            const adminLink = document.createElement('a');
            adminLink.href = '/panel';
            adminLink.className = 'quick-link';
            adminLink.id = 'link-panel';
            adminLink.innerHTML = `
                <span class="icon">⚙️</span>
                <span class="text">Panel de Control</span>
                <span class="arrow">›</span>
            `;
            quickLinksContainer.insertBefore(adminLink, quickLinksContainer.firstChild);
        }
    }
}

function cargarMiFoto() {
    const $imageContainer = document.querySelector('.image-container');
    const $fileInput = document.querySelector('#fileInput');
    const $saveBtn = document.querySelector('#saveBtn');
    const $uploadStatus = document.querySelector('#uploadStatus');
    const $previewImage = document.querySelector('#previewImage');
    if ($imageContainer) {
        $imageContainer.addEventListener('click', () => {
            $fileInput.click();
        });
    }

    if ($fileInput) {
        $fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    $previewImage.style.backgroundImage = `url(${e.target.result})`;
                    $saveBtn.style.display = 'block';
                    $saveBtn.textContent = 'Guardar Nueva Foto';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if ($saveBtn) {
        $saveBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const file = $fileInput.files[0];
            if (!file) return;

            $saveBtn.textContent = 'Subiendo...';
            $saveBtn.disabled = true;

            const formData = new FormData();
            formData.append('FOTO', file);
            formData.append('type', 'profile');
            formData.append('id', user.ID);

            try {
                const response = await fetch(`/api/update/profile`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    user.FOTO = data.foto;
                    localStorage.removeItem('user');
                    localStorage.setItem('user', JSON.stringify(user));
                    const timestamp = new Date().getTime();
                    $previewImage.style.backgroundImage = `url('${user.FOTO}?t=${timestamp}')`;

                    $saveBtn.style.display = 'none';
                    $saveBtn.disabled = false;
                    $uploadStatus.innerHTML = '<span class="mensaje-foto-upload">¡Foto actualizada correctamente!</span>';

                    window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
                    setTimeout(() => { $uploadStatus.innerHTML = ''; }, 3000);
                } else {
                    throw new Error(data.message || 'Error al subir la imagen');
                }
            } catch (error) {
                console.error('Upload error:', error);
                $saveBtn.textContent = 'Reintentar';
                $saveBtn.disabled = false;
                $uploadStatus.innerHTML = '<span class="mensaje-foto-upload">Error al actualizar la foto.</span>';
            }
        });
    }

    const $deleteBtn = document.querySelector('#eliminar_cuenta');
    if ($deleteBtn) {
        $deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                // Implement account deletion logic here if needed
                alert('Funcionalidad de eliminar cuenta en desarrollo.');
            }
        });
    }
}

function cargarMisDatos() {
    const user = JSON.parse(localStorage.getItem('user'));
    const $userFormSection = document.getElementById('user-form-section');
    Object.keys(user).forEach(key => {
        const $userTools = document.createElement('user-tools');
        $userTools.setAttribute('name', key);
        if (key == 'ID' || key == 'APELLIDO' || key === 'FOTO' || key === 'TIPO' || key === 'EMAIL_VERIF') {
            return;
        }
        $userTools.innerHTML = `
            <label slot="label">${key}</label>
        `;
        $userFormSection.appendChild($userTools);
    });

}

function cargarFotoPerfil(misDatosLink) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.FOTO && user.FOTO !== "null") {

        if (misDatosLink) {
            misDatosLink.innerHTML = `<div id="foto-perfil-icon" class="foto-perfil-icon" alt="Foto de perfil">`;
            const fotoPerfilIcon = document.getElementById('foto-perfil-icon');
            fotoPerfilIcon.style.backgroundImage = `url(${user.FOTO})`;
        }
    }
}

function cerrarSesion(btn) {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('lastAuthCheck');
                    user = null;
                    window.location.href = '/login';
                }
            } else {
                console.error('Logout fallido');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });
}





/*
document.querySelector('filtros-del-mate').addEventListener('filtrar', (event) => {
    const query = event.detail;
    consultarProductos(localStorage.getItem('categoria'), JSON.stringify(query));
})*/