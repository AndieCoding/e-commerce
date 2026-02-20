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
        this.user = window.user ? window.user : false;
    }

    getTemplate() {
        return `
        <link rel="stylesheet" href="/css/metpago.css">
        <div class="met-pago-container hidden">
            ${this.renderCheckout()}           
        </div>
        `;
    }

    renderCheckout() {
        return `
            <h3>Medio de pago</h3>
            <div class="total-summary">
            </div>

            <div class="payment-grid">
                <checkout-card img="/img/icons/mercadopago.png" title="Mercado Pago" description="Tarjetas, Debito, Dinero en cuenta" data-method="mercadopago"></checkout-card>
                <checkout-card img="/img/icons/bank-transfer.png" title="Transferencia / Efectivo" description="10% OFF pagando por transferencia" data-method="transferencia"></checkout-card>
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
                        <p>Una vez realizada la transferencia, envianos el comprobante por WhatsApp al +3462 336880 o a nuestro correo elfandelmate@gmail.com.</p>
                    </div>
                </div>
            </div>

            <button id="btn-confirmar" class="btn-confirm" disabled>
                <div class="spinner hidden"></div>
                <span id="btn-text">Confirmar Compra</span>                
            </button>
        `;
    }
    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.getTemplate();
        if (window.user) {
            this.setupListeners();
        }
        document.addEventListener('shippingConfirmed', () => {
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

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                this.selectMethod(method, cards, detailsContainer, confirmBtn);
            });
        });

        confirmBtn.addEventListener('click', () => this.handleConfirmation(confirmBtn));
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
            btnText.innerHTML = '<div id="walletBrick_container">Ir a Mercado Pago</div>';
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
        const items = this.ticket.map(item => ({
            id: item.id,
            cantidad: item.order_quantity
        }));
        const response = await fetch('/api/payments/mp/create_preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items
            })
        });
        const data = await response.json();

        const publicKey = "APP_USR-1c8ae308-1512-4004-a92f-9ef1454d008a";
        const preferenceId = data.id;

        const mp = new MercadoPago(publicKey);
        const bricksBuilder = mp.bricks();
        const renderWalletBrick = async (bricksBuilder) => {
            await bricksBuilder.create("wallet", "walletBrick_container", {
                initialization: {
                    preferenceId: preferenceId,
                }
            });
        };

        renderWalletBrick(bricksBuilder);

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
                window.location.href = '/';
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
