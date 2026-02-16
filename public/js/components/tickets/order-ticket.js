import { Ticket } from "../../models/ticket.js";
import { SimpleItemCard } from "../products/simpleItem-card.js";

export class OrderTicket extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._data = null;
    }

    set data(value) {
        this._data = value instanceof Ticket ? value : new Ticket(value);
        this.render();
    }

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin-bottom: 20px;
                    font-family: Roboto;
                }
                .ticket-container {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .ticket-container:hover {
                    border-color: #4a854d;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .order-id {
                    font-size: 14px;
                    color: #333;
                }
                .date {
                    color: #777;
                    font-size: 0.9em;
                }
                .items-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    font-size: 0.95em;
                }
                .item-name {
                    color: #555;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;                    
                    align-items: center;
                    margin-top: 20px;
                    @media (max-width: 768px) {
                        flex-direction: column-reverse;
                    }
                }
                .total {
                    font-family: Roboto;                    
                    color: #3d523eff;
                    font-weight: 600;
                }
                .actions button {
                    background: none;
                    border: 1px solid #4a854d;
                    color: #4a854d;
                    padding: 5px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: all 0.2s;
                }
                .actions button:hover {
                    background: #4a854d;
                    color: white;
                }
                .status-badge {
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8em;
                }
            </style>
        `;
    }

    render() {
        if (!this._data) return;

        const { n_fac, fecha, total, detalle, status } = this._data;
        console.log(detalle);

        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="ticket-container">
                <div class="header">
                    <span class="order-id">Ticket #${n_fac}</span>
                    <span class="date">${fecha.split('T')[0] + ' ' + fecha.split('T')[1].split('.')[0]}</span>
                </div>
                <div class="body">
                    <ul class="items-list" id="items-container">                        
                    </ul>
                </div>
                <div class="footer">
                    <div class="status">
                        <span class="status-badge">${status}</span>
                    </div>
                    <div class="total">
                        Total: $${total || 0}
                    </div>
                    <!--<div class="actions">
                        <button id="btn-ver">Ver Detalle</button>
                    </div>-->
                </div>
            </div>
        `;

        const container = this.shadowRoot.getElementById('items-container');

        if (detalle && detalle.length > 0) {
            detalle.forEach(item => {
                const card = document.createElement('simple-item-card');
                card.data = item;
                card.setAttribute('quantity', item.cantidad || 0);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="item">Detalle no disponible</p>';
        }
    }
}

customElements.define('order-ticket', OrderTicket);