class Form extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

    }
    getStyles() {
        return `
            <style>          
            * {
                box-sizing: border-box;
            }
            :host{
                display: block;
                margin: auto;
            }
            form {
                width: clamp(300px, 100%, 700px);
                padding: 20px; 
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1em;                
            }
            section {
                width: 90%;
            }    
            input, textarea {
                font-family: "Roboto Condensed", sans-serif;
                width: 100%;
                padding: 0.5em;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 1em;
                margin-bottom: 1em;
            }    
            textarea {
                height: 100px;
            }
            .btn-submit-form {
                padding: 10px 15px;
                color: white;
                background-color: rgb(66, 107, 141);
                font-weight: 600;
                border: none;
                border-radius: 10px;
                margin-top: 15px;

                &:hover {
                    filter: brightness(1.1);
                }
            }   
            </style>
            `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <form class="contacto" name="contacto" data-netlify="true">
                <section>
                    <input type="text" id="nombre" name="nombre" placeholder="Nombre" minlength="2" required>
                </section>
                <section>
                    <input type="email" id="email" name="email" placeholder="Email" minlength="8" required>
                </section>                
                <section>
                    <textarea id="mensaje" name="mensaje" placeholder="Mensaje" minlength="4" maxlength="500" required></textarea>
                </section>
                <section>
                    <button class="btn-submit-form" type="submit">Enviar</button>
                </section>
            </form>
                `

        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.template());


        this.btnSubmit = this.shadowRoot.querySelector('.btn-submit-form');
        this.btnSubmit.addEventListener('click', () => {
            this.form.submit();
        });

        this.form = this.shadowRoot.querySelector('form');
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nombre = this.shadowRoot.querySelector('#nombre').value;
            const email = this.shadowRoot.querySelector('#email').value;
            const mensaje = this.shadowRoot.querySelector('#mensaje').value;
            const data = {
                nombre,
                email,
                mensaje
            };

            formData.append('form-name', 'contacto');
            formData.append('nombre', nombre);
            formData.append('email', email);
            formData.append('mensaje', mensaje);

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });
                const textArea = this.shadowRoot.querySelector('#mensaje');
                if (response.ok) {
                    textArea.value = 'Gracias por tu mensaje.';
                    textArea.style.outline = '2px solid green';
                    setTimeout(() => {
                        textArea.style.outline = 'none';
                    }, 3000);
                    form.reset();
                } else {
                    textArea.value = 'Ocurrió un error al enviar tu mensaje.';
                    textArea.style.outline = '2px solid lightred';
                    console.error('Error de Netlify Forms:', response.status, response.statusText);
                    const errorText = await response.text();
                    console.error('Detalles del error:', errorText);
                }
            } catch (error) {
                console.error('Error de red o JS:', error);
                textArea.value = 'Ocurrió un error al enviar tu mensaje.';
                textArea.style.outline = '2px solid lightred';
            }
        });
    }
}
customElements.define('form-contacto', Form);