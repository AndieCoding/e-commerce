import { Card } from '../components/products/card.js';
import { Categoria } from '../components/index/categoria.js';
import { Menu } from '../components/navigation/menu.js';
import { PortadaImg } from '../components/index/portada-img.js';
import { Footer } from '../components/navigation/footer.js';

window.addEventListener('load', async () => {
    setTimeout(() => {
        document.querySelector('main').classList.remove('hidden');
        document.querySelector('portada-img').classList.remove('hidden');
        document.querySelector('.loader').style.display = 'none';
    }, 1000);

});

document.addEventListener('DOMContentLoaded', () => {
    indexProducts();
})

async function indexProducts() {
    const response = await fetch('/api/indexProducts');
    const data = await response.json();
    const cardsContainer = document.querySelector('.destacados');

    data.forEach(product => {
        const card = document.createElement('product-card');
        card.setAttribute('id', product.ID_PROD);
        card.setAttribute('image', product.P_IMG.replace("..", ""));
        card.setAttribute('name', product.P_NOMBRE);
        card.setAttribute('marca', product.P_MARCA);
        card.setAttribute('price', product.P_PRECIO);
        card.setAttribute('description', product.P_DESCRIPCION);
        card.setAttribute('stock', product.P_CANTIDAD);
        card.setAttribute('type', product.P_TIPO);
        cardsContainer.appendChild(card);
    });
}



