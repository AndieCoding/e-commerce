import {Menu} from '../components/navigation/menu.js';
import { Manager } from '../models/manager.js';
import { Footer } from '../components/navigation/footer.js';

let manager = new Manager();

document.addEventListener('DOMContentLoaded', () => { 

    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {

        e.preventDefault();                
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await manager.ingresar(data);
        
        if (response.success) {         
            window.location.href = "/";
        } else {
            const div = document.createElement('div');
            div.classList.add('loginError');
            div.innerHTML = `<p><span>&#10006;</span> Los datos ingresados son incorrectos</p>`;
            document.querySelector('form.registro').appendChild(div);
            setTimeout(() => {
                div.remove();
            }, 2000);
        }
    });     
})
