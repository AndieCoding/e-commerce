import { Menu } from "../navigation/menu.js";
import { CartController } from "../cart/cart-controller.js";
import { Carrito } from "../cart/carrito.js";
import { MetPago } from "./metpago.js";

export class DireEnvio extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.selectedMethod = null;
        this.shippingCost = 0;
        this.origin = 'Venado Tuerto, Santa Fe';
        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? loggedUser : false;

        // Cost tables by zone
        this.costMapping = {
            'santa fe': 1200,
            'buenos aires': 1800,
            'cordoba': 1600,
            'rosario': 1000,
            'entre rios': 1900
        };
        this.defaultCost = 2500;
    }

    getTemplate() {
        return `
        <link rel="stylesheet" href="../../css/envio.css">
        <div class="shipment-container">
            ${this.user ? this.renderShipmentOptions() : ''}
        </div>
        `;
    }

    renderShipmentOptions() {
        return `
            <h3>Método de Envío</h3>
            <div class="shipment-grid">
                <div class="shipment-card" data-method="sucursal">
                    <img src="../../img/icons/sucursal.png" alt="Sucursal" class="shipment-icon">
                    <h4>Retiro en Sucursal</h4>
                    <p>¡Gratis! Retirá hoy mismo</p>
                </div>

                <div class="shipment-card" data-method="oca">
                    <img src="../../img/icons/oca.png" alt="OCA" class="shipment-icon">
                    <h4>Correo OCA</h4>
                    <p>Envío a todo el país (3-5 días)</p>
                </div>
            </div>

            <div id="shipment-details" class="hidden">
                <div id="details-sucursal" class="details-section hidden">
                    <div class="branch-info">
                        <strong>Sucursal Central - Fan del Mate</strong><br>
                        Av. Siempre Viva 742, CABA.<br>
                        Lunes a Viernes de 09:00 a 18:00 hs.<br>
                        Sábados de 09:00 a 13:00 hs.
                    </div>
                </div>

                <div id="details-oca" class="details-section hidden">
                    <div class="form-group">
                        <label>Código Postal</label>
                        <input type="text" id="cp" placeholder="B2600">
                    </div>
                    <div class="form-group">
                        <label>Localidad / Ciudad</label>
                        <input type="text" id="localidad" placeholder="Venado Tuerto">
                    </div>
                    <div class="form-group">
                        <label>Provincia</label>
                        <input type="text" id="provincia" placeholder="Santa Fe">
                    </div>
                    <div class="form-group">
                        <label>Calle y Altura</label>
                        <input type="text" id="calle" placeholder="Calle Falsa 123">
                    </div>
                </div>

                <div class="shipping-cost-summary">
                    <span>Costo de Envío:</span>
                    <span id="cost-display" class="cost-value">$0.00</span>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.getTemplate();
        if (this.user) {
            this.setupListeners();
        }
    }

    setupListeners() {
        const cards = this.shadowRoot.querySelectorAll('.shipment-card');
        const detailsContainer = this.shadowRoot.querySelector('#shipment-details');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                this.selectMethod(method, cards, detailsContainer);
            });
        });

        const ocaInputs = this.shadowRoot.querySelectorAll('#details-oca input');
        ocaInputs.forEach(input => {
            input.addEventListener('input', () => this.calculateShipping());
        });
    }

    selectMethod(method, cards, detailsContainer) {
        this.selectedMethod = method;

        // Update selection UI
        cards.forEach(c => c.classList.remove('active'));
        this.shadowRoot.querySelector(`.shipment-card[data-method="${method}"]`).classList.add('active');

        // Show details section
        detailsContainer.classList.remove('hidden');
        this.shadowRoot.querySelectorAll('.details-section').forEach(s => s.classList.add('hidden'));
        this.shadowRoot.querySelector(`#details-${method}`).classList.remove('hidden');

        this.calculateShipping();
    }

    async calculateShipping() {
        let cost = 0;
        const display = this.shadowRoot.querySelector('#cost-display');

        if (this.selectedMethod === 'sucursal') {
            cost = 0;
            display.innerHTML = '¡GRATIS!';
            display.classList.remove('cost-pending');
        } else if (this.selectedMethod === 'oca') { // Renombrado internamente a Correo Argentino en el backend
            const cp = this.shadowRoot.querySelector('#cp').value.trim();
            const provincia = this.shadowRoot.querySelector('#provincia').value.trim();

            if (cp.length >= 4) {
                display.textContent = 'Calculando...';
                display.classList.add('cost-pending');

                try {
                    const response = await fetch('/api/shipping/calculate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinationCP: cp,
                            weight: 1000 // Valor por defecto ajustable
                        })
                    });

                    const data = await response.json();

                    if (data.price) {
                        cost = data.price;
                        display.innerHTML = `
                            $${cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}<br>
                            <small style="font-size: 0.7em; color: #666;">
                                ${data.service} (${data.deliveryTime})
                            </small>
                        `;
                        display.classList.remove('cost-pending');
                    } else {
                        throw new Error('No price returned');
                    }
                } catch (error) {
                    console.error('Shipping calculation error:', error);
                    display.textContent = 'Error al calcular. Reintente.';
                    cost = 2500; // Fallback
                }
            } else {
                cost = 0;
                display.textContent = 'Ingrese CP para calcular';
                display.classList.add('cost-pending');
            }
        }

        this.shippingCost = cost;

        // Dispatch event for other components (like Total display)
        this.dispatchEvent(new CustomEvent('shippingCostUpdated', {
            detail: {
                method: this.selectedMethod,
                cost: this.shippingCost,
                origin: this.origin
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('dire-envio', DireEnvio);
