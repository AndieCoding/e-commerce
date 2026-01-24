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
          align-items: start;
          padding: 20px;
          padding-top: 0;         
        }
        .historial-facturas h4 {
          width: 100%;
          margin: 20px;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 200;
        }
        .lista-facturas {
          list-style: none;
          margin: 0;
          padding: 0;
          width: 100%;
          //overflow-y: scroll;
          //scrollbar-color: #4a854dff #41464170;
          //scrollbar-width: thin;
        }
        .factura {
          display: flex;
          justify-content: space-between;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 200;
          border-radius: 5px;

          &:hover {            
            background-color: #0d89011c;            
            cursor: default;
          }
        }
        .factura a {
          text-decoration: none;
          color: #575656;

          :visited {
            color: gray;
          }          
        }
    </style>
    `;
  }
  template() {
    const template = document.createElement('template');
    template.innerHTML = `     
    ${this.getStyles()}
    
    <div class="historial-facturas">
      <ul class="lista-facturas">
        <li class="factura">No hay compras para mostrar</a></li>
      </ul>
    </div>
    `;
    return template.content.cloneNode(true);
  }
  connectedCallback() {
    this.render();
    //this.consultaHistorialFacturas();
  }
  async render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.template());
  }

  async consultaHistorialFacturas() {
    try {
      this.userId = JSON.parse(localStorage.getItem('user')).ID;
      // revisar fetch - no pasar query params
      const response = await fetch(`/api/compras_usuario/${this.userId}`);
      const data = await response.json();
      console.log(data);
      this.shadowRoot.querySelector('.lista-facturas').innerHTML = data.map(factura =>
        `<li class="factura"><a class="factura-link" href="#" data-image="${factura.FACT_US}">${factura.HORA.slice(0, 10)} - N. Fact. ${factura.N_FACTURA}</a></li>`).join('');
      console.log(data);

      this.shadowRoot.querySelectorAll('.factura-link').forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const imageUrl = event.target.getAttribute('data-image');
          if (imageUrl) {
            window.open(imageUrl, '_blank');
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
}
customElements.define('historial-facturas', HistorialFacturas);