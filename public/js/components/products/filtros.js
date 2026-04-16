export class Filtros extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.filtrosActivos = {
            atributos: {},
            precio: null
        };
        this.mockPrices = [
            { value: '0-5000', label: 'Menos de $5.000', id: 'price-1' },
            { value: '5000-10000', label: '$5.000 - $10.000', id: 'price-2' },
            { value: '10000-999999', label: 'Más de $10.000', id: 'price-3' }
        ];
        this.filtrosDisponibles = null;
        this.categoria = localStorage.getItem('categoria') || 'mates';
    }

    async connectedCallback() {
        await this.cargarFiltrosDinamicos(this.categoria);
    }

    // DISPUTATIO: ¿Render completo o parcial?
    // Pro: El render completo asegura que los chips y checkboxes estén sincronizados.
    // Contra: Pierde el foco del teclado. Solución: Usar delegación de eventos.
    render() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
            :host {
                display: block;
                font-family: 'Roboto Condensed', sans-serif;
                color: var(--body-text);
                background-color: var(--bg-color);
                padding: 15px;
            }
            h3 { color: var(--body-text); border-bottom: 1px solid var(--accent-color, #00ffff); padding-bottom: 8px; margin-bottom: 15px; }
            h4 { color: var(--accent-color, #00ffff); font-size: 12px; margin: 15px 0 10px; text-transform: uppercase; }
            
            .option-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; cursor: pointer; font-size: 14px; }
            .option-row input { accent-color: var(--accent-color, #00ffff); cursor: pointer; }
            
            .active-filters { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; }
            .chip { 
                background: var(--accent-color, #00ffff); 
                color: #000; 
                padding: 2px 8px; 
                border-radius: 4px; 
                font-size: 11px; 
                display: flex; 
                align-items: center; 
                gap: 5px; 
            }
            .chip button { background: none; border: none; cursor: pointer; font-weight: bold; }

            .btn-clear {
                width: 100%; padding: 10px; margin-top: 20px;
                background: transparent; border: 1px solid var(--accent-color, #00ffff);
                color: var(--accent-color, #00ffff); border-radius: 4px; cursor: pointer;
                font-size: 12px; font-weight: bold; transition: 0.3s;
            }
            .btn-clear:hover { background: var(--accent-color, #00ffff); color: #000; }
        </style>

        <div class="container">
            <h3>Filtrar por</h3>
            <div class="active-filters" id="active-container"></div>
            
            <div id="sections-container">
                <h4>Precio</h4>
                ${this.mockPrices.map(p => `
                    <label class="option-row">
                        <input type="radio" name="precio" value="${p.value}" ${this.filtrosActivos.precio === p.value ? 'checked' : ''}>
                        ${p.label}
                    </label>
                `).join('')}

                <div id="dynamic-filters"></div>
            </div>

            <button class="btn-clear" id="btn-clear">Limpiar Filtros</button>
        </div>
        `;

        this.renderDynamicSections();
        this.renderChips();
        this.setupEventListeners();
    }

    renderDynamicSections() {
        if (!this.filtrosDisponibles) return;
        const container = this.shadowRoot.querySelector('#dynamic-filters');

        let html = '';
        Object.keys(this.filtrosDisponibles).forEach(nombreAtr => {
            html += `<h4>${nombreAtr}</h4>`;
            this.filtrosDisponibles[nombreAtr].forEach(valor => {
                const isChecked = this.filtrosActivos.atributos[nombreAtr]?.includes(valor);
                html += `
                    <label class="option-row">
                        <input type="checkbox" data-atr="${nombreAtr}" value="${valor}" ${isChecked ? 'checked' : ''}>
                        ${valor}
                    </label>
                `;
            });
        });
        container.innerHTML = html;
    }

    renderChips() {
        const container = this.shadowRoot.querySelector('#active-container');
        let chipsHtml = '';

        if (this.filtrosActivos.precio) {
            const label = this.mockPrices.find(p => p.value === this.filtrosActivos.precio)?.label;
            chipsHtml += `<div class="chip"><span>${label}</span><button data-type="precio">&times;</button></div>`;
        }

        Object.keys(this.filtrosActivos.atributos).forEach(atr => {
            this.filtrosActivos.atributos[atr].forEach(val => {
                chipsHtml += `<div class="chip"><span>${val}</span><button data-type="atr" data-name="${atr}" data-val="${val}">&times;</button></div>`;
            });
        });
        container.innerHTML = chipsHtml;
    }

    setupEventListeners() {
        // Eventos de Checkbox y Radio (Delegación para evitar pérdida de listener)
        this.shadowRoot.querySelectorAll('input').forEach(input => {
            input.onchange = (e) => {
                if (e.target.type === 'radio') {
                    this.filtrosActivos.precio = e.target.value;
                } else {
                    const { atr } = e.target.dataset;
                    const val = e.target.value;
                    if (!this.filtrosActivos.atributos[atr]) this.filtrosActivos.atributos[atr] = [];

                    if (e.target.checked) {
                        this.filtrosActivos.atributos[atr].push(val);
                    } else {
                        this.filtrosActivos.atributos[atr] = this.filtrosActivos.atributos[atr].filter(v => v !== val);
                    }
                }
                this.notify();
            };
        });

        // Eventos de Chips
        this.shadowRoot.querySelectorAll('.chip button').forEach(btn => {
            btn.onclick = (e) => {
                const { type, name, val } = e.target.dataset;
                if (type === 'precio') this.filtrosActivos.precio = null;
                if (type === 'atr') {
                    this.filtrosActivos.atributos[name] = this.filtrosActivos.atributos[name].filter(v => v !== val);
                }
                this.notify();
            };
        });

        this.shadowRoot.querySelector('#btn-clear').onclick = () => {
            this.filtrosActivos = { atributos: {}, precio: null };
            this.notify();
        };
    }

    async cargarFiltrosDinamicos(categoria) {
        try {
            const mapper = { 'mates': 1, 'termos': 2, 'yerbas': 3, 'equipos': 4, 'canastos': 5 };
            const categoriaId = mapper[categoria] || 1;
            const res = await fetch(`/api/filtros/${categoriaId}`);
            const data = await res.json();
            this.filtrosDisponibles = data.filtros;
            this.render();
        } catch (err) { console.error(err); }
    }

    notify() {
        this.render(); // Re-renderizamos para actualizar visualmente
        this.dispatchEvent(new CustomEvent('filtrar', {
            detail: this.filtrosActivos,
            bubbles: true,
            composed: true // CRÍTICO: Para que atraviese el Shadow DOM
        }));
    }
}
customElements.define('filtros-del-mate', Filtros);