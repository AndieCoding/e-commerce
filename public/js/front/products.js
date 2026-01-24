import { Card } from '../components/products/card.js';
import { Carrito } from '../components/cart/carrito.js';
import { Categoria } from '../components/index/categoria.js';
import { Menu } from '../components/navigation/menu.js';
import { Filtros } from '../components/products/filtros.js';
import { Footer } from '../components/navigation/footer.js';


document.querySelector('filtros-del-mate').addEventListener('filtrar', (event) => {
    const query = event.detail;
    consultarProductos(localStorage.getItem('categoria'), JSON.stringify(query));
})

document.addEventListener('turbo:load', () => {
    const contenedor = document.querySelector('.resultados');
    if (contenedor) {
        const categoria = localStorage.getItem('categoria') || 'mates';
        const query = localStorage.getItem('query');
        if (categoria === 'busqueda' && query) {
            consultarProductos(null, query);
        } else {
            consultarProductos(categoria);
        }
    }
});

async function consultarProductos(categoria, query) {
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
                crearCards(document.querySelector('.resultados'), p);
            });
        } else {
            contenedor.innerHTML = '<p>No se encontraron productos</p>';
        }
    } catch (error) {
        console.error("Error en el servidor: ", error);
        contenedor.innerHTML = '<p>Error de conexión. Reintente más tarde</p>';
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
    card.setAttribute('description', producto.P_DESCRIPCION);
    card.setAttribute('stock', producto.P_CANTIDAD);
    card.setAttribute('type', producto.P_TIPO);
    if (document.querySelector('.resultados').classList.contains('grid')) {
        card.setAttribute('tipo', 'grid');
    } else {
        card.setAttribute('tipo', 'list');
    }
    card.classList.add('fade-in-card');
    container.appendChild(card);
}

document.addEventListener('click', (e) => {

    if (e.target.closest('#boton-filtro')) {
        document.querySelector('.filtros').classList.toggle('mostrar');
    }

    if (e.target.closest('#grid')) {
        const resultados = document.querySelector('.resultados');
        resultados.classList.replace('list', 'grid');
        document.querySelectorAll('product-card').forEach(card => card.setAttribute('tipo', 'grid'));
    }

    if (e.target.closest('#list')) {
        const resultados = document.querySelector('.resultados');
        resultados.classList.replace('grid', 'list');
        document.querySelectorAll('product-card').forEach(card => card.setAttribute('tipo', 'list'));
    }
});