import '../turbo.js';
import { Card } from '../components/products/card.js';
import { Categoria } from '../components/index/categoria.js';
import { Filtros } from '../components/products/filtros.js';
import { UserB } from "../models/user-b.js";
import { UserTools } from '../components/user/user-tools.js';
import { Footer } from '../components/navigation/footer.js';
import { Menu } from '../components/navigation/menu.js';
import { MobileNavBar } from '../components/navigation/mobile-nav-bar.js';
import { DireEnvio } from '../components/products/envio.js';
import { MetPago } from '../components/products/metpago.js';
import { Producto } from '../models/producto.js';

window.indexProducts = async function indexProducts() {
    const cardsContainer = document.querySelector('#destacados');
    if (!cardsContainer) return;
    mostrarSkeletons(cardsContainer, 6);
    const response = await fetch('/api/indexProducts');
    const data = await response.json();
    cardsContainer.innerHTML = '';
    const productos = data.map(product => new Producto(product));
    productos.forEach(product => { crearCards(cardsContainer, product); });

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
window.commonScales = {
    y: {
        beginAtZero: true,
        ticks: {
            stepSize: 1,
            callback: (value) => Math.round(value)
        }
    }
};

window.lineOptions = {
    responsive: true,
    scales: {
        ...window.commonScales,
        x: { title: { display: true, text: 'Días' } },
        y: { ...window.commonScales.y, title: { display: true, text: 'Ventas totales' } }
    }
};

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
        if (path.startsWith('/admin') || path.startsWith('/panel-')) {
            await cargarComponentesAdmin();
        }

        //productos-index
        const cardsContainer = document.querySelector('#destacados');
        if (cardsContainer) {
            indexProducts();
        }

        //productos
        const contenedorResultados = document.querySelector('.resultados');
        if (contenedorResultados) {
            cargarProductos();
        }

        //mi-cuenta
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

        //mis-datos
        const misDatosContainer = document.getElementById('mis-datos-container');
        if (misDatosContainer) {
            cargarMiFoto();
            cargarMisDatos();
        }

        //panel-informes
        const informesContainer = document.getElementById('informes-container');
        if (informesContainer) {
            //cargarInformes();
        }

        //panel-administrar 
        const administrar_container = document.querySelector('#productList');
        if (administrar_container) {
            cargarProductosAdmin(administrar_container);
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', filtrar);
            }
        }

        //enviar
        const envioContainer = document.querySelector('#envio-container');
        if (envioContainer) {
            cargarEnvio(envioContainer);
        }
    })

    window.addEventListener('userUpdated', (event) => {
        const $previewImage = document.querySelector('#previewImage');
        if ($previewImage) {
            let foto = event.detail.foto;
            if (foto && foto !== null) {
                $previewImage.style.backgroundImage = `url(${foto})`;
            } else {
                $previewImage.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
            }
        }
    });

    document.addEventListener("turbo:before-visit", async (event) => {
        const urlDestino = new URL(event.detail.url);
        const rutasProtegidas = ['/user_menu', '/mis_datos', '/mis_compras', '/panel', '/panel-altas', '/panel-administrar', '/panel-informes'];
        const esRutaProtegida = rutasProtegidas.some(ruta => urlDestino.pathname.startsWith(ruta));

        if (esRutaProtegida) {
            const logueado = await checkAuth(true);
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

function cargarEnvio(container) {
    container.innerHTML = '';
    if (checkAuth(false)) {
        container.appendChild(new DireEnvio());
    }
    if (document.querySelector('dire-envio')) {
        container.appendChild(new MetPago());
    }
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

function crearCards(container, producto, admin = false) {
    const card = document.createElement(admin ? 'admin-product-row' : 'product-card');
    card.data = producto;
    if (document.querySelector('.resultados')) {
        if (document.querySelector('.resultados').classList.contains('grid')) {
            card.setAttribute('tipo', 'grid');
        } else {
            card.setAttribute('tipo', 'list');
        }
    }

    if (admin) {
        card.addEventListener('delete-product', async (e) => {
            const id = e.detail.id;
            await deleteProduct(id);
        });

        card.addEventListener('edit-product', (e) => {
            const id = e.detail.id;
            window.location.href = `/panel-altas?edit=${id}`;
        });

    }

    card.classList.add('fade-in-card');
    container.appendChild(card);
}

async function cargarProductosAdmin(container) {
    //mostrarSkeletons(container, 10);
    let productos = [];
    try {
        const categories = ['mates', 'termos', 'yerbas'];
        for (const cat of categories) {
            const response = await fetch(`/api/products/${cat.replace('s', '')}`);
            const data = await response.json();
            if (data.products) {
                productos = [...productos, ...data.products];
            }
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        container.innerHTML = '<div class="error">Error al cargar productos.</div>';
    }
    container.innerHTML = '';
    productos.forEach(producto => {
        crearCards(container, producto, true);
    });
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
    if (user.tipo) {

        if (quickLinksContainer) {
            const adminLink = document.createElement('a');
            adminLink.href = '/panel-informes';
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
            formData.append('foto', file);
            formData.append('type', 'profile');
            formData.append('id', user.id);

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
        if (key === 'foto' || key === 'tipo' || key === 'email_verif') {
            return;
        }
        $userTools.innerHTML = `
            <label slot="label">${key.toUpperCase()}</label>
        `;
        $userFormSection.appendChild($userTools);
    });
}

function cargarFotoPerfil(misDatosLink) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.foto) {

        if (misDatosLink) {
            misDatosLink.innerHTML = `<div id="foto-perfil-icon" class="foto-perfil-icon" alt="Foto de perfil">`;
            const fotoPerfilIcon = document.getElementById('foto-perfil-icon');
            fotoPerfilIcon.style.backgroundImage = `url(${user.foto})`;
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

async function cargarComponentesAdmin() {
    try {
        await Promise.all([
            import('../components/navigation/admin-nav.js'),
            import('../components/navigation/admin-mobile-nav-bar.js'),
            import('../components/products/admin-product-row.js')
        ]);
    } catch (error) {
        console.error("Error cargando los componentes admin:", error);
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            alert('Producto eliminado correctamente');
            cargarProductosAdmin(document.querySelector('.product-list'));
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al conectar con el servidor');
    }
}

const filtrar = (e) => {
    const term = e.target.value.toLowerCase();
    const rows = productList.querySelectorAll('admin-product-row');
    rows.forEach(row => {
        const name = row.getAttribute('name').toLowerCase();
        if (name.includes(term)) {
            row.style.display = 'block';
        } else {
            row.style.display = 'none';
        }
    })
};


/*
document.querySelector('filtros-del-mate').addEventListener('filtrar', (event) => {
    const query = event.detail;
    consultarProductos(localStorage.getItem('categoria'), JSON.stringify(query));
})*/