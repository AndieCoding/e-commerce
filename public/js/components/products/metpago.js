import { CartController } from "../cart/cart-controller.js";
import { CheckoutCard } from "../checkout/checkout-card.js";

export class MetPago extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.total = this.cartController.getTotal();
        this.ticket = this.cartController.getProducts();
        this.selectedMethod = null;
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    getTemplate() {
        return `
        <link rel="stylesheet" href="/css/metpago.css">
        <div class="met-pago-container hidden">
            <h3>Medio de pago</h3>
            <div class="total-summary">
            </div>

            <div class="payment-grid">
                <checkout-card img="mp" title="Mercado Pago" description="Tarjetas, Debito, Dinero en cuenta" data-method="mercadopago"></checkout-card>
                <checkout-card img="ef" title="Transferencia / Efectivo" description="10% OFF pagando por transferencia" data-method="transferencia"></checkout-card>
            </div>

            <div id="method-details" class="hidden">
                <div id="details-mercadopago" class="payment-details-section hidden">
                    <div class="guest-form">
                        <h4>Datos de facturación / contacto</h4>
                        <p class="form-helper">Usaremos estos datos para enviarte el comprobante de pago.</p>
                        <div class="input-group">
                            <label for="guest-email">Email *</label>
                            <input type="email" id="guest-email" placeholder="ejemplo@correo.com" required>
                        </div>
                        <div class="input-group">
                            <label for="guest-name">Nombre completo *</label>
                            <input type="text" id="guest-name" placeholder="Juan Pérez" required>
                        </div>
                    </div>
                </div>
                <div id="details-transferencia" class="payment-details-section hidden">
                    <div class="agreement-info">
                        <h5>Datos para la transferencia:</h5>
                        <ul>
                            <li><strong>Banco:</strong> Galicia</li>
                            <li><strong>Alias:</strong> fan.del.mate</li>
                            <li><strong>CBU:</strong> 0070123456789012345678</li>
                        </ul>
                        <p>Una vez realizada la transferencia, envianos el comprobante por WhatsApp al +3462 336880 o a nuestro correo elfandelmate@gmail.com.</p>
                    </div>
                </div>
            </div>

            <button id="btn-confirmar" class="btn-confirm" disabled>
                <div class="spinner hidden"></div>
                <span id="btn-text">Confirmar Compra</span>                
            </button>         
        </div>
        `;
    }

    connectedCallback() {
        this.render();
        if (this.user) {
            this.shadowRoot.querySelector('#guest-email').value = this.user.email;
            this.shadowRoot.querySelector('#guest-name').value = this.user.nombre;
        }
    }

    render() {
        this.shadowRoot.innerHTML = this.getTemplate();

        this.setupListeners();

        document.addEventListener('shippingConfirmed', () => {
            console.log('shippingConfirmed');
            this.shadowRoot.querySelector('.met-pago-container').classList.remove('hidden');
        });
        document.addEventListener('shippingReset', () => {
            this.shadowRoot.querySelector('.met-pago-container').classList.add('hidden');
        });
    }

    setupListeners() {
        const cards = this.shadowRoot.querySelectorAll('checkout-card');
        const detailsContainer = this.shadowRoot.querySelector('#method-details');
        const confirmBtn = this.shadowRoot.querySelector('#btn-confirmar');
        const emailInput = this.shadowRoot.querySelector('#guest-email');
        const nameInput = this.shadowRoot.querySelector('#guest-name');

        [emailInput, nameInput].forEach(input => {
            input.addEventListener('input', () => this.validateForm());
        });

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                this.selectMethod(method, cards, detailsContainer, confirmBtn);
            });
        });

        confirmBtn.addEventListener('click', () => this.handleConfirmation(confirmBtn));
    }
    validateForm() {
        const email = this.shadowRoot.querySelector('#guest-email').value;
        const name = this.shadowRoot.querySelector('#guest-name').value;
        const confirmBtn = this.shadowRoot.querySelector('#btn-confirmar');

        const isValid = email.includes('@') && name.trim().length > 3;
        confirmBtn.disabled = !isValid;
    }

    selectMethod(method, cards, detailsContainer, confirmBtn) {
        this.selectedMethod = method;
        cards.forEach(c => c.classList.remove('active'));
        this.shadowRoot.querySelector(`checkout-card[data-method="${method}"]`).classList.add('active');
        detailsContainer.classList.remove('hidden');
        this.shadowRoot.querySelectorAll('.payment-details-section').forEach(s => s.classList.add('hidden'));
        this.shadowRoot.querySelector(`#details-${method}`).classList.remove('hidden');

        confirmBtn.disabled = false;
        const btnText = confirmBtn.querySelector('span');
        if (method === 'mercadopago') {
            btnText.textContent = 'Ir a Mercado Pago';
        } else {
            btnText.textContent = 'Finalizar y Acordar';
        }
    }

    async handleConfirmation(btn) {
        btn.disabled = true;
        const btnText = btn.querySelector('span');
        const originalText = btnText.textContent;
        const spinner = btn.querySelector('.spinner');
        spinner.classList.remove('hidden');
        btnText.textContent = 'Procesando...';
        let result;

        try {
            if (this.selectedMethod === 'mercadopago') {
                result = await this.procesarMercadoPago();
            } else {
                result = await this.procesarTransferencia(btn, btnText, originalText);
            }
        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            btnText.classList.add('error');
            btn.disabled = true;
            setTimeout(() => {
                btnText.textContent = originalText;
                btnText.classList.remove('error');
                btn.disabled = false;
            }, 2000);
        }
        if (result) {
            btnText.textContent = originalText;
            spinner.classList.add('hidden');
            btn.disabled = false;
        }
    }

    async procesarMercadoPago() {
        const email = this.shadowRoot.querySelector('#guest-email').value;
        const nombre = this.shadowRoot.querySelector('#guest-name').value;

        const items = this.ticket.map(item => ({
            id: item.id,
            cantidad: item.order_quantity
        }));
        const response = await fetch('/api/payments/mp/create_preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                guestUser: { email, nombre }
            })
        });
        const data = await response.json();

        if (data.init_point) {
            window.location.href = data.init_point;
            return true;
        } else {
            throw new Error('No se recibió el link de pago');
            return false;
        }
    }

    async procesarTransferencia(btn, btnText, originalText) {
        const pedido = {
            productos: this.ticket.map(p => ({
                id: p.id,
                cantidad: p.order_quantity
            })),
            met_pago: 1
        };

        const response = await fetch('/api/registrarVenta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        const result = await response.json();

        if (result.success) {
            btnText.textContent = '¡Compra Confirmada!';
            btn.style.background = '#28a745';
            this.cartController.vaciarCarrito();

            setTimeout(() => {
                alert(`¡Gracias por tu compra! Tu pedido #${result.orderId} ha sido registrado. Envianos el comprobante por WhatsApp.`);
                window.location.href = '/mis_compras';
            }, 500);
            return true;
        } else {
            throw new Error(result.message || 'Error al guardar la orden.');
        }
    }

    resetButton(btn, btnText, originalText) {
        btn.disabled = false;
        btnText.textContent = originalText;
    }
}

customElements.define('met-pago', MetPago);
