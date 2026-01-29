import { Manager } from '../models/manager.js';


let manager = new Manager();

document.addEventListener('turbo:load', () => {

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
            div.innerHTML = `<p><span>&#10006;</span> ${response.message || 'Los datos ingresados son incorrectos'}</p>`;
            form.appendChild(div);
            setTimeout(() => {
                div.remove();
            }, 2000);
        }
    });
})
