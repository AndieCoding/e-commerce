export class PortadaImg extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.images = [
            '/img/img/portada-component/portada-mate.jpg',
            '/img/img/portada-component/portada-mate1.jpg',
            '/img/img/portada-component/portada-mate2.jpg',
            '/img/img/portada-component/portada-mate3.jpg'
        ];

        this.phrases = [
            'Sabor y tradición',
            'Momentos que reconfortan',
            'Transformá lo cotidiano en algo especial',
            'Lo mejor de nuestras raíces'
        ];

        this.currentIndex = 0;
        this.letterInterval = null; // Almacena el intervalo para letras

        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: calc(100vh - 60px);
                    max-width: 100%;
                    margin: 0 auto;
                    @media (width<700px) {
                        height: 90vh;
                    }
                }
                
                #portada-image {
                    width: 100%;
                    height: 100%;
                    display: block;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    object-fit: cover;
                    object-position: bottom center;
                    filter: brightness(0.8);
                }

                .text-overlay {
                    font-family: 'Tangerine', serif;
                    position: absolute;
                    transform: translateX(-50%);
                    color: white;                    
                    padding: 5px 35px;                    
                    font-size: 96px;
                    text-align: center;
                    opacity: 0; 
                    animation: slideInFromTop 1s forwards; 
                    text-shadow: 4px 4px 4px rgb(119, 169, 119);
                    @media (width<700px) {
                        font-size: 56px;
                        top: 40%;
                    }
                }
                    button {
                    display: none;}

                /*button.prev, button.next {
                    background-color: transparent;
                    border: none;
                    color: white;
                    font-size: 36px;
                    padding: 10px;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                button.prev {
                    left: 10px;
                }
                
                button.next {
                    right: 10px;
                }
                
                button.prev:hover, button.next:hover {
                    background: radial-gradient(circle, rgba(0, 0, 255, 0.3) 30%, rgba(0, 0, 255, 0) 60%);
                    border-radius: 40%;
                    box-shadow: 0 0 20px rgba(0, 0, 255, 0.4);
                    transition: background 0.3s, box-shadow 0.3s;
                }*/

                @keyframes slideInFromTop {
                    0% {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .text-overlay.slide-in {
                    animation: slideInFromTop 1s forwards; /* Animación de entrada desde arriba */
                }
            </style>
            <div class="container">
                <img id="portada-image" src="${this.images[this.currentIndex]}" alt="Portada Image" loading="lazy">
                <div class="text-overlay">${this.phrases[this.currentIndex]}</div>
                <button class="prev">&#10094;</button>
                <button class="next">&#10095;</button>
            </div>
        `;

        this.productImage = this.shadowRoot.getElementById('portada-image');
        this.textOverlay = this.shadowRoot.querySelector('.text-overlay');
        this.nextButton = this.shadowRoot.querySelector('.next');
        this.prevButton = this.shadowRoot.querySelector('.prev');

        this.nextButton.addEventListener('click', () => this.nextImage());
        this.prevButton.addEventListener('click', () => this.prevImage());

        this.autoSlide = setInterval(() => this.nextImage(), 4000);
    }

    updateImage() {
        this.productImage.src = this.images[this.currentIndex];


        if (this.letterInterval) {
            clearInterval(this.letterInterval);
        }


        this.textOverlay.classList.remove('slide-in');
        void this.textOverlay.offsetWidth;
        this.textOverlay.classList.add('slide-in');


        const text = this.phrases[this.currentIndex];
        this.textOverlay.textContent = '';
        let index = 0;

        this.letterInterval = setInterval(() => {
            if (index < text.length) {
                this.textOverlay.textContent += text[index];
                index++;
            } else {
                clearInterval(this.letterInterval);
            }
        }, 50);
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    disconnectedCallback() {
        clearInterval(this.autoSlide);
        clearInterval(this.letterInterval);
    }
}

customElements.define('portada-img', PortadaImg);

