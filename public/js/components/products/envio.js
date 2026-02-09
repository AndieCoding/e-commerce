import { MetPago } from "./metpago.js";
import { CheckoutCard } from "../checkout/checkout-card.js";

export class DireEnvio extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.selectedMethod = null;
        this.shippingCost = 0;
        //this.origin = 'Venado Tuerto, Santa Fe';
        this.user = window.user ? window.user : false;

        this.costMapping = {
            'santa fe': 4500,
            'buenos aires': 5800,
            'cordoba': 4600,
            'rosario': 3800,
            'entre rios': 5500
        };
        this.defaultCost = 4500;
    }

    getTemplate() {
        return `
        <link rel="stylesheet" href="/css/envio.css">
        <style>
            .legend {
                font-size: 0.6em;
                color: #666;
            }
        </style>
        <div class="shipment-container">         
            ${this.user ? this.renderShipmentOptions() : this.renderRestriction()}
        </div>
        `;
    }

    renderShipmentOptions() {
        return `
            <h3>Método de Envío</h3>
            <div class="shipment-grid">
                <checkout-card img="/img/icons/sucursal.png" title="Retiro en Sucursal" description="¡Gratis! Retirá hoy mismo" data-method="sucursal"></checkout-card>
                <checkout-card img="/img/icons/oca.png" title="Correo OCA" description="Envío a todo el país (3-5 días)" data-method="oca"></checkout-card>
            </div>

            <div id="shipment-details" class="hidden">
                <div id="details-sucursal" class="details-section hidden">
                    <div class="branch-info">
                        <strong>Sucursal Central - Fan del Mate</strong><br>
                        Venado Tuerto, Santa Fe.<br>
                        Lunes a Viernes de 09:00 a 18:00 hs.<br>
                        Sábados de 09:00 a 13:00 hs.
                    </div>
                </div>

                <div id="details-oca" class="details-section">
                <div class="form-envio">
                    <div class="form-group">
                        <label>Código Postal</label>
                        <input type="text" id="cp" placeholder="B2600">
                    </div>
                    <div class="form-group">
                        <label>Localidad</label>
                        <input type="text" id="localidad" placeholder="Venado Tuerto">
                    </div>
                    <div class="form-group">
                        <label>Provincia</label>
                        <input type="text" id="provincia" placeholder="Santa Fe">
                    </div>
                    <div class="form-group">
                        <label>Calle y Altura</label>
                        <input type="text" id="calle" placeholder="Calle 123">
                    </div>
                    </div>
                    <div class="shipping-cost-summary">
                        <p class="costo-label">Costo de Envío:</p>
                        <p id="cost-display" class="cost-value">$0.00</p>
                    </div>
                </div>
                <button id="btn-continue" class="btn-confirm hidden">
                    CONTINUAR
                </button>
            </div>
        `;
    }

    connectedCallback() {
        this.render();
    }

    renderRestriction() {
        return `
        <div class="restriction-container">
            <h3>Debe iniciar sesión para continuar</h3>
            <img src="../../img/banner/imagen-necesita-login.jpg" alt="Login required">
            <br>
            <a href="/login" class="btn-login">Iniciar Sesión</a>
        </div>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = this.getTemplate();
        if (this.user) {
            this.setupListeners();
        }
    }

    setupListeners() {
        const cards = this.shadowRoot.querySelectorAll('checkout-card');
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

        const btnContinue = this.shadowRoot.querySelector('#btn-continue');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => this.confirmShipping());
        }
    }

    selectMethod(method, cards, detailsContainer) {
        this.selectedMethod = method;
        cards.forEach(c => c.classList.remove('active'));
        this.shadowRoot.querySelector(`checkout-card[data-method="${method}"]`).classList.add('active');
        detailsContainer.classList.remove('hidden');

        this.shadowRoot.querySelectorAll('.details-section').forEach(s => s.classList.add('hidden'));
        this.shadowRoot.querySelector(`#details-${method}`).classList.remove('hidden');
        if (method === 'sucursal') {
            this.shadowRoot.querySelector(`#details-${method}`).style.gridTemplateColumns = '1fr';
            this.shadowRoot.querySelector(`#details-${method}`).style.justifyItems = 'center';
        }

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
                            weight: 1000
                        })
                    });

                    const data = await response.json();

                    if (data.price) {
                        cost = data.price;
                        display.innerHTML = `
                            $${cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}<br>
                            <p class="legend">
                                ${data.service} <br> (${data.deliveryTime})
                            </p>
                        `;
                        display.classList.remove('cost-pending');
                    } else {
                        throw new Error('No price returned');
                    }
                } catch (error) {
                    console.error('Shipping calculation error:', error);
                    display.textContent = 'Error al calcular. Reintente.';
                    cost = 4500;
                }
            } else {
                cost = 0;
                display.textContent = 'Ingrese CP para calcular';
                display.classList.add('cost-pending');
            }
        }

        const btnContinue = this.shadowRoot.querySelector('#btn-continue');
        if (btnContinue && this.selectedMethod && cost !== null) {
            btnContinue.classList.remove('hidden');
        }

        /* Dispatch event for other components (like Total display)
        this.shippingCost = cost;
        this.dispatchEvent(new CustomEvent('shippingCostUpdated', {
            detail: {
                method: this.selectedMethod,
                cost: this.shippingCost,
                origin: this.origin
            },
            bubbles: true,
            composed: true
        }));*/
    }

    confirmShipping() {
        const detailsContainer = this.shadowRoot.querySelector('#shipment-details');
        const cardsContainer = this.shadowRoot.querySelector('.shipment-grid');
        const title = this.shadowRoot.querySelector('h3');

        // Hide selection UI
        cardsContainer.classList.add('hidden');
        detailsContainer.classList.add('hidden');

        // Show Summary
        const summary = document.createElement('div');
        summary.className = 'shipment-summary';
        summary.innerHTML = `
            <div class="summary-card">
                <div class="summary-info">
                    <div class="summary-header">
                        <img id="back-arrow" src="/img/icons/back-arrow.svg" alt="back-arrow" class="back-arrow">
                        <span  class="summary-label">Método de envío seleccionado</span>
                    </div>
                    <div class="summary-method-price-container">
                        <p class="summary-method">${this.selectedMethod === 'sucursal' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}</p>
                        <p class="summary-cost">
                            ${this.shippingCost === 0 ? 'GRATIS' : `$${this.shippingCost.toLocaleString('es-AR')}`}
                        </p>
                    </div>
                    <div class="summary-location">
                        ${this.selectedMethod === 'sucursal' ? 'Venado Tuerto, Santa Fe' : this.shadowRoot.querySelector('#localidad')?.value || 'Belgrano 768'}
                    </div>
                    </div>
                <div class="summary-cost-section">
                                        
                </div>
            </div>
        `;

        if (title) title.style.display = 'none';

        const container = this.shadowRoot.querySelector('.shipment-container');
        container.appendChild(summary);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        summary.querySelector('#back-arrow').addEventListener('click', () => {
            summary.remove();
            if (title) title.style.display = 'block';
            cardsContainer.classList.remove('hidden');
            detailsContainer.classList.remove('hidden');

            this.dispatchEvent(new CustomEvent('shippingReset', { bubbles: true, composed: true }));
        });

        // Dispatch completion event
        this.dispatchEvent(new CustomEvent('shippingConfirmed', {
            detail: {
                method: this.selectedMethod,
                cost: this.shippingCost
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('dire-envio', DireEnvio);
