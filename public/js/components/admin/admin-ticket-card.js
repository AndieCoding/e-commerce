export class AdminTicketCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._data = null;
    }

    set data(value) {
        this._data = value;
        this.render();
    }

    get data() {
        return this._data;
    }

    connectedCallback() {
        if (this._data) this.render();
    }

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    font-family: 'Roboto', sans-serif;
                }
                .venta-admin-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 0.5em;
                    padding-left: 1em;
                    border: 1px solid #eef2f6;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    align-items: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .venta-admin-card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.12);
                }
                .info {
                    display: flex;
                    gap: 1.5rem;
                    padding-top: 0.5em;
                }
                .info-header {                    
                    margin: 0;                    
                }
                .info-main {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .info-n_fac {
                    font-size: 14px;
                    color: #525b6bff;
                    margin: 0;
                }
                .info-fecha {
                    font-size: 14px;
                    color: #525b6bff;
                    margin: 0;
                }
                .info-sub {
                    font-size: 0.9rem;
                    color: #718096;
                    margin: 0;
                }
                .price-tag {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0.5rem 0 0 0;
                }
                .actions {
                    display: flex;
                    align-items: start;
                }
                .btn-view {
                    background: transparent;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                .open-icon {
                    height: 30px;
                }
                .controls-group {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }
                .control-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #a0aec0;
                    letter-spacing: 0.025em;
                }
                select {
                    padding: 0.6rem 2rem 0.6rem 0.8rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: #4a5568;
                    background-color: #f8fafc;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Step Id: 19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.7rem center;
                    background-size: 1rem;
                    transition: border-color 0.2s;
                }
                select:focus {
                    outline: none;
                    border-color: #1ea155ff;
                    box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
                }
                
                
                @media (max-width: 900px) {
                    .venta-admin-card {
                        grid-template-columns: auto 1fr;
                    }
                    .actions {
                        grid-column: span 2;
                        justify-content: flex-end;
                    }
                }
                @media (max-width: 600px) {
                    .venta-admin-card {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .ticket-icon {
                        display: none;
                    }
                    .actions {
                        grid-column: span 1;
                    }
                    .controls-group {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            </style>
        `;
    }

    render() {
        if (!this._data) return;

        const { n_fac, nom_cl, total, status, env_stus, fechaFormateada } = this._data;

        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="venta-admin-card">                
                <div class="info">
                    <div class="info-main">
                        <p class="info-header">
                            <span class="info-n_fac">#${n_fac}</span>
                            <span class="info-fecha">${fechaFormateada}</span>
                        </p>
                        <p class="info-sub">Cliente: ${nom_cl || 'Desconocido'}</p>
                        <p class="price-tag">$${parseFloat(total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div class="actions">
                        <button id="btn-view" class="btn-view">
                            <img class="open-icon" src="/img/icons/open.svg" alt="Abrir Ticket">                        
                        </button>
                    </div>
                </div>

                <div class="controls-group">
                    <div class="control-item">
                        <label>Estado del Pago</label>
                        <select id="pago-status">
                            <option value="pendiente" ${status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="aprobado" ${status === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                            <option value="rechazado" ${status === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                        </select>
                    </div>

                    <div class="control-item">
                        <label>Estado del Envío</label>
                        <select id="envio-status">
                            <option value="pendiente" ${env_stus === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="enviado" ${env_stus === 'enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="entregado" ${env_stus === 'entregado' ? 'selected' : ''}>Entregado</option>
                        </select>
                    </div>
                </div>

            </div>
        `;

        // Add event listeners programmatically to avoid CSP issues with inline handlers
        this.shadowRoot.getElementById('pago-status').addEventListener('change', (e) => {
            this.handleStatusChange('pago', e.target.value);
        });

        this.shadowRoot.getElementById('envio-status').addEventListener('change', (e) => {
            this.handleStatusChange('envio', e.target.value);
        });

        this.shadowRoot.getElementById('btn-view').addEventListener('click', () => {
            this.handleViewTicket();
        });
    }

    handleStatusChange(type, value) {
        if (type === 'pago') {
            if (typeof window.updatePagoStatus === 'function') {
                window.updatePagoStatus(this._data.n_fac, value);
            } else {
                console.warn('updatePagoStatus is not defined globally');
            }
        } else if (type === 'envio') {
            if (typeof window.updateEnvioStatus === 'function') {
                window.updateEnvioStatus(this._data.n_fac, value);
            } else {
                console.warn('updateEnvioStatus is not defined globally');
            }
        }
    }

    handleViewTicket() {
        // Usamos id_fac ya que es el identificador único en la DB para el detalle
        const id = this._data.id_fac || this._data.n_fac;
        console.log('Solicitando ver detalle del ticket ID:', id);

        if (typeof window.verTicketCompleto === 'function') {
            window.verTicketCompleto(id);
        } else {
            this.dispatchEvent(new CustomEvent('view-ticket', {
                detail: { id: id },
                bubbles: true,
                composed: true
            }));
            console.warn('verTicketCompleto no está definida globalmente');
        }
    }
}

customElements.define('admin-ticket-card', AdminTicketCard);
