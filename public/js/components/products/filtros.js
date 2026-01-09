export class Filtros extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.categoria = localStorage.getItem('categoria');
        this.filtrosActivos = {};
    }    
    getStyles() {
        return `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            :host {
                background-color: #81bb7c;                
                border-radius: 10px;
                outline: 2px solid #056f05;  
                font-family: Roboto Condensed;              
                @media (width<900px){                
                    display: flex;
                    width: 400px;
                    justify-content: center;
                    margin: auto;
                    gap: 1em;
                }
                    @media (width<600px){
                    width: 100%;

                }
            }
            .precios, .marcas {
                margin-top: 20px
                @media (width<900px){
                   margin-top: 5px;
                }
            }
            h3{
                text-transform: uppercase;
                font-size: 12px;
                margin: 0;
                @media (width<900px){
                    font-size: 8px;
                }
            }
            label {                
                margin-right: 10px;  
                font-size: 14px;      
                
                 @media (width<900px){
                    font-size:8px;
                    margin:0;
                }        
            }
            input[type="radio"] {
                margin-right: 5px;    
                border-radius: 50%;
                @media (width<900px){
                    margin: 0;
                }                
            }    
            input[type="radio"]:checked {
                outline: 2px solid #056f05;  
            }
            .reset {
                margin-top: 30px;
                text-align: center;
                @media (width<900px){
                    width: 80px;
                    margin-top: 0;
                    align-self: center;
                }
                @media (width<600px){
                    width: 50px;                    
                }
            }
            .btn-clear {
                padding: 5px 10px;
                background-color:rgb(253, 253, 253);
                color: #66daff;
                outline: 2px solid lightblue;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                &:hover {
                    background-color: lightblue;
                    outline: 2px solid #96e0eb;
                    color: #052f9f;
                }
                @media (width<900px){
                    font-size: 10px;
                    padding: 5px;
                }
            }
                .contenedor-input-radio {
                    display: flex;
                    justify-content: start;
                    align-items: center;
                    gap: 0.5em;
                    margin: 5px 0;
                    @media (width<900px){
                        gap: 0.3em;
                    }
                }
        </style>
        `;
    }

    template(){
        const template = document.createElement('template');
        template.innerHTML = this.getStyles() + `
           <div class="precios">
                <h3>Precios</h3>
            </div>
            <div class="marcas">
                <h3>Marcas</h3>                
            </div>
            <div class="reset">
                <button class="btn-clear">Limpiar Filtros</button>
            </div>
        `
        return template.content.cloneNode(true);
    }

    async connectedCallback() {
        this.shadowRoot.appendChild(this.template());     
        await this.loadFilters();
        this.addEventListeners();
    }
    addEventListeners() {
        this.shadowRoot.querySelectorAll('input[type="radio"]').forEach(element => {
            element.addEventListener('change', (e) => {                                
                this.filtrosActivos[e.target.name] = e.target.value;
                this.dispatchEvent(new CustomEvent('filtrar', { detail:  this.filtrosActivos }));
            });
        })
        this.shadowRoot.querySelector('.btn-clear').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    async loadFilters() {
        const precios = [
            { value: 'precio<5001', label: "Hasta $5.000", rel: 'price-1' }, 
            { value: 'precio>4999 && precio<10000', label: "Entre $5.000 y $10.000", rel: 'price-2' }, 
            { value: 'precio>10000', label: "Más de $10.000", rel: 'price-3' }
        ];
        let marcas = [];
        if (this.categoria !== 'mates') {
            marcas = await this.loadBrands() ;
        } else {
            this.shadowRoot.querySelector('.marcas').innerHTML = "";
        }
        this.populateFilters(precios, marcas);
    }

    populateFilters(precios, marcas) {        
        this.shadowRoot.querySelector('.precios').innerHTML += precios.map(
            price => 
                `<div class="contenedor-input-radio"><input type="radio" name="precio" value="${price.value}" id="${price.rel}"><label for="${price.rel}">${price.label}</label></div>`).join('');
        this.shadowRoot.querySelector('.marcas').innerHTML += marcas.map(
            brand => 
                `<div class="contenedor-input-radio"><input type="radio" name="marca" value="${brand.marca}" id="${brand.marca}"><label for="${brand.marca}">${brand.marca}</label></div>`).join('');    
    }
    async loadBrands() {
        try {
            //const response = await fetch(`/api/marcas/${this.categoria}`);
            //const data = await response.json();            
            const productsString = localStorage.getItem('products');
            const products = JSON.parse(productsString);
            const uniqueBrands = new Set(
                products
                    .filter(p => { return p.tipo === this.categoria}) 
                    .map(p => p.marca)                     
            );
            const data = Array.from(uniqueBrands).map(marca => ({ marca }));
            return data;
            
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }
    clearFilters() {
        this.shadowRoot.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        window.location.reload();      
    }
}

customElements.define('filtros-del-mate', Filtros);
