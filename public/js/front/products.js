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

document.addEventListener('DOMContentLoaded', () => {

    const categoria = localStorage.getItem('categoria');
    if (categoria === 'busqueda') {
        searchProducts(localStorage.getItem('query'));
    } else if (!categoria) {
        console.log('sin categoria');
        localStorage.setItem('categoria', 'mates')
        consultarProductos('mates')
    } else {
        consultarProductos(categoria);
    };

    document.getElementById('boton-filtro').addEventListener('click', () => {
        document.querySelector('.filtros').classList.toggle('mostrar');
        console.log(document.querySelector('.filtros').classList)
    })
    document.getElementById('grid').addEventListener('click', () => {
        document.querySelector('.resultados').classList.add('grid');
        document.querySelector('.resultados').classList.remove('list');
        const cards = document.querySelectorAll('product-card');
        cards.forEach(card => {
            card.setAttribute('tipo', 'grid');
        })
    })

    document.getElementById('list').addEventListener('click', () => {
        document.querySelector('.resultados').classList.add('list');
        document.querySelector('.resultados').classList.remove('grid');
        const cards = document.querySelectorAll('product-card');
        cards.forEach(card => {
            card.setAttribute('tipo', 'list');
        })
    })

})

async function consultarProductos(categoria, query) {
    const contenedor = document.querySelector('.resultados');
    mostrarSkeletons(contenedor, 8);
    try {
        const response = await fetch(`/api/products/${categoria.replace('s', '')}${query ? "/" + query : ""}`);
        const data = await response.json();
        contenedor.innerHTML = '';
        data.products.forEach(p => {
            crearCards(document.querySelector('.resultados'), p);
        });
    } catch (error) {
        console.log(error);
    }
}

async function searchProducts(query) {
    const contenedor = document.querySelector('.resultados');
    const response = await fetch(`/api/search/${query}`);
    const data = await response.json();
    contenedor.innerHTML = '';
    data.products.forEach(p => {
        crearCards(document.querySelector('.resultados'), p);
    });
    localStorage.removeItem('query');
    localStorage.removeItem('categoria');
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
