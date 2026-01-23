document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');

    async function fetchProducts() {
        try {
            const categories = ['mates', 'termos', 'yerbas'];
            let allProducts = [];

            for (const cat of categories) {
                const response = await fetch(`/api/products/${cat.replace('s', '')}`);
                const data = await response.json();
                if (data.products) {
                    allProducts = [...allProducts, ...data.products];
                }
            }

            renderProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<div class="error">Error al cargar productos.</div>';
        }
    }

    function renderProducts(products) {
        productList.innerHTML = '';
        if (products.length === 0) {
            productList.innerHTML = '<div class="no-results">No se encontraron productos.</div>';
            return;
        }

        products.forEach(p => {
            const row = document.createElement('admin-product-row');
            row.setAttribute('id', p.ID_PROD);
            row.setAttribute('image', p.P_IMG);
            row.setAttribute('name', p.P_NOMBRE);
            row.setAttribute('type', p.P_TIPO);
            row.setAttribute('stock', p.P_CANTIDAD);
            row.setAttribute('price', p.P_PRECIO);

            row.addEventListener('delete-product', async (e) => {
                const id = e.detail.id;
                await deleteProduct(id);
            });

            row.addEventListener('edit-product', (e) => {
                const id = e.detail.id;
                window.location.href = `/altas?edit=${id}`;
            });

            productList.appendChild(row);
        });
    }

    async function deleteProduct(id) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                alert('Producto eliminado correctamente');
                fetchProducts();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al conectar con el servidor');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = productList.querySelectorAll('admin-product-row');
        rows.forEach(row => {
            const name = row.getAttribute('name').toLowerCase();
            if (name.includes(term)) {
                row.style.display = 'block';
            } else {
                row.style.display = 'none';
            }
        });
    });

    fetchProducts();
});
