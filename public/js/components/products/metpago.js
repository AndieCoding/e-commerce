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
        const btnText = btn.querySelector('span');
        const originalText = btnText.textContent;
        btnText.textContent = 'Procesando...';

        try {
            if (this.selectedMethod === 'mercadopago') {
                await this.procesarMercadoPago();
            } else if (this.selectedMethod === 'transferencia') {
                await this.procesarTransferencia(spinner, btn, btnText, originalText);
            } else {
                alert('Método aún no implementado completamente.');
                this.resetButton(btn, spinner, btnText, originalText);
            }
        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            alert('Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.');
            this.resetButton(btn, spinner, btnText, originalText);
        }
    }

    async procesarMercadoPago() {
        const items = this.ticket.map(item => ({
            title: `${item.productType} ${item.marca} ${item.nombre}`,
            unit_price: item.precio,
            quantity: item.cantidad
        }));

        const response = await fetch('/api/payments/mp/create_preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                payer: {
                    email: this.user.email,
                    name: `${this.user.nombre} ${this.user.apellido}`
                },
                external_reference: `ORDER-${Date.now()}` // Temporary reference
            })
        });

        const data = await response.json();

        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            throw new Error('No se recibió el link de pago');
        }
    }

    async procesarTransferencia(spinner, btn, btnText, originalText) {
        // Prepare order data for backend
        // Note: internal "P_..." keys usually come from DB, but cart might use different structure.
        // Adapting cart items to what backend RegistrarVenta expects.

        const productosParaBackend = this.ticket.map(item => ({
            P_TIPO: item.productType,  // Backend expects P_TIPO
            P_ID: item.id,             // Backend expects P_ID
            P_CANTIDAD: item.cantidad,
            P_PRECIO: item.precio,
            P_NOMBRE: item.nombre,
            P_MARCA: item.marca
        }));

        const orderData = {
            userEmail: this.user.email,
            productos: productosParaBackend,
            total: this.total,
            fecha: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format mostly safely parsed
            empresa: 'Fan del Mate Web'
        };

        const response = await fetch('/api/payments/transfer/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // Success UX
            spinner.classList.add('hidden');
            btnText.textContent = '¡Pedido Confirmado!';
            btn.style.background = '#28a745';

            // Clear cart
            this.cartController.vaciarCarrito();

            setTimeout(() => {
                alert(`¡Gracias por tu compra! Tu pedido #${result.orderId} ha sido registrado. Envianos el comprobante por WhatsApp.`);
                window.location.href = '/';
            }, 500);
        } else {
            throw new Error(result.message || 'Error al guardar la orden.');
        }
    }

    resetButton(btn, spinner, btnText, originalText) {
        spinner.classList.add('hidden');
        btn.disabled = false;
        btnText.textContent = originalText;
    }
}

customElements.define('met-pago', MetPago);
