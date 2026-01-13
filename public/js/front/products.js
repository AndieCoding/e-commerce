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
    const response = await fetch(`http://localhost:3000/api/products/${categoria.replace('s', '')}${query ? "/" + query : ""}`);

    const data = await response.json();

    contenedor.innerHTML = '';
    data.products.forEach(p => {
        const card = document.createElement('product-card');
        card.setAttribute('id', p.ID_PROD);
        card.setAttribute('image', p.P_IMG);
        card.setAttribute('name', p.P_NOMBRE);
        card.setAttribute('price', p.P_PRECIO);
        card.setAttribute('oferta', p.P_PR_OFERTA || 0);
        card.setAttribute('marca', p.P_MARCA);
        card.setAttribute('description', p.P_DESCRIPCION);
        card.setAttribute('stock', p.P_CANTIDAD);
        card.setAttribute('type', p.P_TIPO);
        if (document.querySelector('.resultados').classList.contains('grid')) {
            card.setAttribute('tipo', 'grid');
        } else {
            card.setAttribute('tipo', 'list');
        }
        document.querySelector('.resultados').appendChild(card);
    });
}

async function searchProducts(query) {
    const contenedor = document.querySelector('.resultados');
    const response = await fetch(`http://localhost:3000/api/search/${query}`);

    const data = await response.json();

    contenedor.innerHTML = '';
    data.products.forEach(p => {
        const card = document.createElement('product-card');
        card.setAttribute('id', p.ID_PROD);
        card.setAttribute('image', p.P_IMG);
        card.setAttribute('name', p.P_NOMBRE);
        card.setAttribute('price', p.P_PRECIO);
        card.setAttribute('oferta', p.P_PR_OFERTA || 0);
        card.setAttribute('marca', p.P_MARCA);
        card.setAttribute('description', p.P_DESCRIPCION);
        card.setAttribute('stock', p.P_CANTIDAD || 0);
        card.setAttribute('type', p.P_TIPO);
        document.querySelector('.resultados').appendChild(card);
    });
    localStorage.removeItem('query');
    localStorage.removeItem('categoria');
}
