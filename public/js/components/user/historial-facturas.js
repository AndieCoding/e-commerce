import { SimpleOrderTicket } from "../tickets/simple-order-ticket.js";

export class HistorialFacturas extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  getStyles() {
    return `
    <style>
        :host {
          display: block;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;          
        }
        .historial-facturas {
          display: flex;
          flex-direction: column;
          width: 100%;
          align-items: center;
          padding: 20px 0;
          padding-top: 0;         
          @media (max-width: 768px) {
            padding: 0;
          }
        }
        h3 {
            color: #666;
            font-weight: 300;
        }
    </style>
    `;
  }

  connectedCallback() {
    this.render();
    this.consultaHistorialFacturas();
  }

  async render() {
    this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        <div class="historial-facturas" id="lista">
            <div class="spinner">Cargando...</div>
        </div>
    `;
  }

  async consultaHistorialFacturas() {
    try {
      const user = window.user || JSON.parse(localStorage.getItem('user'));

      if (!user) {
        this.shadowRoot.querySelector('#lista').innerHTML = '<h3>Inicia sesión para ver tus compras</h3>';
        return;
      }

      const response = await fetch('/api/compras_usuario');

      if (!response.ok) throw new Error('Error al obtener compras');

      const data = await response.json();
      const container = this.shadowRoot.querySelector('#lista');
      container.innerHTML = '';

      if (data.length === 0) {
        container.innerHTML = '<h3>No tienes compras registradas aún.</h3>';
        return;
      }

      data.forEach(factura => {
        const link = document.createElement('a');
        link.href = `/mis_compras/ticket?id=${factura.id_fac}`;
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        link.style.width = '100%';

        const ticket = document.createElement('simple-order-ticket');
        ticket.data = factura;

        link.appendChild(ticket);
        container.appendChild(link);
      });

    } catch (err) {
      console.error(err);
      this.shadowRoot.querySelector('#lista').innerHTML = '<h3>Error al cargar el historial.</h3>';
    }
  }
}
customElements.define('historial-facturas', HistorialFacturas);