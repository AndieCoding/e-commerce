import { CartController } from "../cart/cart-controller.js";
import { Carrito } from "../cart/carrito.js";
import { User } from "../../models/user.js";


export class MetPago extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.total = this.cartController.getTotal();
        this.ticket = this.cartController.getProducts();
        this.selectedMethod = null;

        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? loggedUser : false;
    }

    getTemplate() {
        return `
        <link rel="stylesheet" href="../../css/metpago.css">
        <div class="met-pago-container">
            ${this.user ? this.renderCheckout() : this.renderRestriction()}
        </div>
        `;
    }

    renderCheckout() {
        return `
            <h3>Finalizar Compra</h3>
            <div class="total-summary">
                Total a pagar: <span class="total-amount">$${this.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div class="payment-grid">
                <div class="payment-card" data-method="mercadopago">
                    <img src="../../img/icons/mercadopago.png" alt="Mercado Pago" class="payment-icon">
                    <h4>Mercado Pago</h4>
                    <p>Tarjetas, Debito, Dinero en cuenta</p>
                </div>

                <div class="payment-card" data-method="transferencia">
                    <img src="../../img/icons/bank-transfer.png" alt="Transferencia" class="payment-icon">
                    <h4>Transferencia / Efectivo</h4>
                    <p>10% OFF pagando por transferencia</p>
                </div>

                <div class="payment-card" data-method="tarjeta_directa">
                    <img src="../../img/icons/credit-card.png" alt="Tarjeta" class="payment-icon">
                    <h4>Tarjeta Directa</h4>
                    <p>A través de nuestro gateway seguro</p>
                </div>
            </div>

            <div id="method-details" class="hidden">
                <div id="details-mercadopago" class="payment-details-section hidden">
                    <p>Vas a ser redirigido a la plataforma segura de Mercado Pago para completar tu pago.</p>
                </div>

                <div id="details-transferencia" class="payment-details-section hidden">
                    <div class="agreement-info">
                        <strong>Datos para la transferencia:</strong>
                        <ul>
                            <li><strong>Banco:</strong> Galicia</li>
                            <li><strong>Alias:</strong> fan.del.mate</li>
                            <li><strong>CBU:</strong> 0070123456789012345678</li>
                        </ul>
                        <p>Una vez realizada la transferencia, envianos el comprobante por WhatsApp.</p>
                    </div>
                </div>

                <div id="details-tarjeta_directa" class="payment-details-section hidden">
                    <label>Número de tarjeta</label>
                    <input type="text" id="numeroTarjeta" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19">
                    <div style="display: flex; gap: 1rem;">
                        <div style="flex: 1;">
                            <label>Vencimiento</label>
                            <input type="text" id="fechaVencimiento" placeholder="MM/AA" maxlength="5">
                        </div>
                        <div style="flex: 1;">
                            <label>CVV</label>
                            <input type="password" id="codigoSeguridad" placeholder="***" maxlength="4">
                        </div>
                    </div>
                    <label>Titular</label>
                    <input type="text" id="titular" placeholder="Nombre como figura en la tarjeta">
                </div>
            </div>

            <button id="btn-confirmar" class="btn-confirm" disabled>
                <span>Confirmar Compra</span>
                <div id="spinner" class="spinner hidden"></div>
            </button>
        `;
    }

    renderRestriction() {
        return `
        <div class="restriction-container">
            <h3>Debe estar logueado para comprar</h3>
            <img src="../../img/banner/imagen-necesita-login.jpg" alt="Login required">
            <br>
            <a href="/login" class="btn-login">Iniciar Sesión</a>
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
        const cards = this.shadowRoot.querySelectorAll('.payment-card');
        const detailsContainer = this.shadowRoot.querySelector('#method-details');
        const confirmBtn = this.shadowRoot.querySelector('#btn-confirmar');
        const spinner = this.shadowRoot.querySelector('#spinner');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                this.selectMethod(method, cards, detailsContainer, confirmBtn);
            });
        });

        const cardNumInput = this.shadowRoot.querySelector('#numeroTarjeta');
        if (cardNumInput) {
            cardNumInput.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        confirmBtn.addEventListener('click', () => this.handleConfirmation(confirmBtn, spinner));
    }

    selectMethod(method, cards, detailsContainer, confirmBtn) {
        this.selectedMethod = method;

        // Update selection UI
        cards.forEach(c => c.classList.remove('active'));
        this.shadowRoot.querySelector(`.payment-card[data-method="${method}"]`).classList.add('active');

        // Show details section
        detailsContainer.classList.remove('hidden');
        this.shadowRoot.querySelectorAll('.payment-details-section').forEach(s => s.classList.add('hidden'));
        this.shadowRoot.querySelector(`#details-${method}`).classList.remove('hidden');

        // Enable button
        confirmBtn.disabled = false;

        // Update button text contextually
        const btnText = confirmBtn.querySelector('span');
        if (method === 'mercadopago') {
            btnText.textContent = 'Pagar con Mercado Pago';
        } else if (method === 'transferencia') {
            btnText.textContent = 'Finalizar y Acordar';
        } else {
            btnText.textContent = 'Realizar Pago';
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = value.match(/.{1,4}/g)?.join('-') || value;
        e.target.value = formatted.substring(0, 19);
    }

    async handleConfirmation(btn, spinner) {
        btn.disabled = true;
        spinner.classList.remove('hidden');

        // Logic for each method
        console.log(`Confirming purchase with: ${this.selectedMethod}`);

        setTimeout(() => {
            spinner.classList.add('hidden');
            btn.disabled = false;
            // Here we would normally redirect or show a success modal
            alert(`Simulación: Compra confirmada vía ${this.selectedMethod}`);
        }, 2000);
    }
}

customElements.define('met-pago', MetPago);
