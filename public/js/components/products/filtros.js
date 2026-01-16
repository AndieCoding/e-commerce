export class Filtros extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.filtrosActivos = {
            marcas: [],
            precio: null
        };
        this.mockBrands = ['Playadito', 'Taragui', 'Mañanita', 'Amanda', 'La Merced', 'Rosamonte'];
        this.mockPrices = [
            { value: 'precio<5000', label: 'Menos de $5.000', id: 'price-1' },
            { value: 'precio>=5000 && precio<=10000', label: '$5.000 - $10.000', id: 'price-2' },
            { value: 'precio>10000', label: 'Más de $10.000', id: 'price-3' }
        ];
    }

    connectedCallback() {
        this.render();
    }

    getStyles() {
        return `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap');
            
            :host {
                display: block;
                font-family: 'Roboto Condensed', sans-serif;
                border-radius: 12px;
                width: 100%;
                box-sizing: border-box;
                color: #333;
            }

            h3 {
                font-size: 18px;
                font-weight: 700;
                margin-top: 0;
                margin-bottom: 20px;
                color: #1a1a1a;
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 10px;
            }

            h4 {
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                margin: 20px 0 10px 0;
                color: #555;
            }
            .active-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 20px;
            }

            .chip {
                background-color: #e8f5e9;
                color: #2e7d32;
                border: 1px solid #c8e6c9;
                border-radius: 16px;
                padding: 4px 10px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .chip:hover {
                background-color: #c8e6c9;
            }

            .chip button {
                background: none;
                border: none;
                color: #2e7d32;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                line-height: 1;
                display: flex;
                align-items: center;
            }

            /* Filter Groups */
            .filter-group {
                margin-bottom: 20px;
            }

            .option-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                cursor: pointer;
                font-size: 14px;
                color: #444;
                transition: color 0.2s;
            }

            .option-row:hover {
                color: #2e7d32;
            }

            input[type="checkbox"], input[type="radio"] {
                accent-color: #2e7d32;
                margin-right: 10px;
                cursor: pointer;
                width: 16px;
                height: 16px;
            }

            label {
                cursor: pointer;
                user-select: none;
                flex: 1;
            }

            /* Clear Button */
            .btn-clear {
                width: 100%;
                padding: 10px;
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-family: inherit;
                font-weight: 600;
                color: #666;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
            }

            .btn-clear:hover {
                background-color: #f5f5f5;
                color: #333;
                border-color: #ccc;
            }

            /* Responsive */
            @media (max-width: 900px) {
                :host {
                    padding: 15px;
                }
            }
        </style>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = this.getStyles();

        // Container
        const container = document.createElement('div');
        container.className = 'container';

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Filtrar por';
        container.appendChild(title);

        // Active Filters Section
        const activeFiltersContainer = document.createElement('div');
        activeFiltersContainer.className = 'active-filters';
        this.renderActiveFilters(activeFiltersContainer);
        container.appendChild(activeFiltersContainer);

        // Price Section
        const priceGroup = document.createElement('div');
        priceGroup.className = 'filter-group';
        priceGroup.innerHTML = `<h4>Precio</h4>`;
        this.mockPrices.forEach(price => {
            const row = document.createElement('div');
            row.className = 'option-row';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'precio';
            input.value = price.value;
            input.id = price.id;
            if (this.filtrosActivos.precio === price.value) {
                input.checked = true;
            }
            input.addEventListener('change', (e) => this.handlePriceChange(e.target.value));

            const label = document.createElement('label');
            label.htmlFor = price.id;
            label.textContent = price.label;

            row.appendChild(input);
            row.appendChild(label);
            priceGroup.appendChild(row);
        });
        container.appendChild(priceGroup);

        // Brands Section
        const brandGroup = document.createElement('div');
        brandGroup.className = 'filter-group';
        brandGroup.innerHTML = `<h4>Marcas</h4>`;
        this.mockBrands.forEach(brand => {
            const row = document.createElement('div');
            row.className = 'option-row';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'marca';
            input.value = brand;
            input.id = `brand-${brand}`;
            if (this.filtrosActivos.marcas.includes(brand)) {
                input.checked = true;
            }
            input.addEventListener('change', (e) => this.handleBrandChange(e.target.value, e.target.checked));

            const label = document.createElement('label');
            label.htmlFor = `brand-${brand}`;
            label.textContent = brand;

            row.appendChild(input);
            row.appendChild(label);
            brandGroup.appendChild(row);
        });
        container.appendChild(brandGroup);

        // Clear Button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-clear';
        clearBtn.textContent = 'Limpiar Filtros';
        clearBtn.addEventListener('click', () => this.clearFilters());
        container.appendChild(clearBtn);

        this.shadowRoot.appendChild(container);
    }

    renderActiveFilters(container) {
        container.innerHTML = '';

        // Price Chip
        if (this.filtrosActivos.precio) {
            const priceLabel = this.mockPrices.find(p => p.value === this.filtrosActivos.precio)?.label || 'Precio';
            const chip = this.createChip(priceLabel, () => {
                this.filtrosActivos.precio = null;
                this.notifyChange();
                this.render();
            });
            container.appendChild(chip);
        }

        // Brand Chips
        this.filtrosActivos.marcas.forEach(brand => {
            const chip = this.createChip(brand, () => {
                this.filtrosActivos.marcas = this.filtrosActivos.marcas.filter(b => b !== brand);
                this.notifyChange();
                this.render();
            });
            container.appendChild(chip);
        });
    }

    createChip(text, onClose) {
        const chip = document.createElement('div');
        chip.className = 'chip';

        const span = document.createElement('span');
        span.textContent = text;

        const btn = document.createElement('button');
        btn.innerHTML = '&times;';
        btn.onclick = onClose;

        chip.appendChild(span);
        chip.appendChild(btn);
        return chip;
    }

    handlePriceChange(value) {
        this.filtrosActivos.precio = value;
        this.notifyChange();
        this.render();
    }

    handleBrandChange(value, isChecked) {
        if (isChecked) {
            this.filtrosActivos.marcas.push(value);
        } else {
            this.filtrosActivos.marcas = this.filtrosActivos.marcas.filter(m => m !== value);
        }
        this.notifyChange();
        this.render();
    }

    clearFilters() {
        this.filtrosActivos = { marcas: [], precio: null };
        this.notifyChange();
        this.render();
    }

    notifyChange() {
        this.dispatchEvent(new CustomEvent('filtrar', {
            detail: {
                marcas: this.filtrosActivos.marcas,
                price: this.filtrosActivos.precio
            }
        }));
    }
}

customElements.define('filtros-del-mate', Filtros);
