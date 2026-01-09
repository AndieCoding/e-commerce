import { Menu } from "../components/navigation/menu.js";
import { Footer } from '../components/navigation/footer.js';
import { UserTools } from "../components/user/user-tools.js";
import { HistorialFacturas } from "../components/user/historial-facturas.js";
import { User } from "../models/user.js";

document.addEventListener('DOMContentLoaded', () => {
    const user = new User(JSON.parse(localStorage.getItem('user')));
    const $saveBtn = document.querySelector('#saveBtn');
    const $img = document.querySelector('.previewImage');
    if (user.FOTO !== null && user.FOTO !== "null") {
        $img.style.backgroundImage = `url(${user.FOTO})`;
        $saveBtn.textContent = 'Cambiar';
    } else {
        $img.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
    }
    const $input = document.querySelector('input[type="file"]');
    $saveBtn.addEventListener('click', (event) => {
        event.preventDefault();
        $input.click();
    });
    $input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('FOTO', file);
        formData.append('type', 'profile');

        const response = await fetch(`http://localhost:3000/api/update/profile/${user.ID}`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            console.log(data);
            console.log(user);
            if (user.FOTO == null || user.FOTO == "null") {
                $img.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
                return;
            }
            user.setFoto(data.foto);
            localStorage.setItem('user', user.stringify());
            const timestamp = new Date().getTime();
            $img.style.backgroundImage = `url('${user.FOTO}?t=${timestamp}')`;
        }
    });
});
const accHistorial = document.querySelector('#acceso-historial-facturas');
const compHistorial = document.querySelector('historial-facturas');
const compEditarUsuario = document.querySelector('#editar-usuario');
accHistorial.addEventListener('click', (event) => {
    event.preventDefault();
    accHistorial.classList == 'active' ? '' : accHistorial.classList.add('active');
    accMisDatos.classList.remove('active');
    if (compHistorial.classList !== 'open') {
        compHistorial.style.display = 'block';
        requestAnimationFrame(() => {
            compHistorial.classList.toggle('open');
        });
    }
    compEditarUsuario.style.display = 'none';
    compEditarUsuario.classList.remove('open');
});
const accMisDatos = document.querySelector('#acceso-mis-datos');
accMisDatos.addEventListener('click', (event) => {
    event.preventDefault();
    accMisDatos.classList == 'active' ? '' : accMisDatos.classList.add('active');
    accHistorial.classList.remove('active');
    if (compEditarUsuario.classList !== 'open') {
        compEditarUsuario.style.display = 'block';
        requestAnimationFrame(() => {
            compEditarUsuario.classList.toggle('open');
        });
    }
    compHistorial.style.display = 'none';
    compHistorial.classList.remove('open');
});
