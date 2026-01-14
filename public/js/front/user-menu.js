import { Menu } from "../components/navigation/menu.js";
import { Footer } from '../components/navigation/footer.js';
import { UserTools } from "../components/user/user-tools.js";
import { HistorialFacturas } from "../components/user/historial-facturas.js";
import { User } from "../models/user.js";

document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const user = new User(userData);
    if (!userData || !user) {
        window.location.href = '/login';
        return;
    }

    const $imageContainer = document.querySelector('.image-container');
    const $previewImage = document.querySelector('#previewImage');
    const $fileInput = document.querySelector('#fileInput');
    const $saveBtn = document.querySelector('#saveBtn');
    const $uploadStatus = document.querySelector('#uploadStatus');

    if (user.FOTO && user.FOTO !== "null") {
        $previewImage.style.backgroundImage = `url(${user.FOTO})`;
    } else {
        $previewImage.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
    }

    $imageContainer.addEventListener('click', () => {
        $fileInput.click();
    });

    $fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                $previewImage.style.backgroundImage = `url(${e.target.result})`;
                $saveBtn.style.display = 'block';
                $saveBtn.textContent = 'Guardar Nueva Foto';
            };
            reader.readAsDataURL(file);
        }
    });

    $saveBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const file = $fileInput.files[0];
        if (!file) return;

        $saveBtn.textContent = 'Subiendo...';
        $saveBtn.disabled = true;

        const formData = new FormData();
        formData.append('FOTO', file);
        formData.append('type', 'profile');

        try {
            const response = await fetch(`http://localhost:3000/api/update/profile/${user.ID}`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                user.FOTO = data.foto;
                user.setProperty('FOTO', data.foto);
                localStorage.setItem('user', user.stringify());
                const timestamp = new Date().getTime();
                $previewImage.style.backgroundImage = `url('${user.FOTO}?t=${timestamp}')`;

                $saveBtn.style.display = 'none';
                $saveBtn.disabled = false;
                $uploadStatus.innerHTML = '<span style="color: green;">¡Foto actualizada correctamente!</span>';
                setTimeout(() => { $uploadStatus.innerHTML = ''; }, 3000);
            } else {
                throw new Error(data.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Upload error:', error);
            $saveBtn.textContent = 'Reintentar';
            $saveBtn.disabled = false;
            $uploadStatus.innerHTML = '<span style="color: red;">Error al actualizar la foto.</span>';
        }
    });

    const $deleteBtn = document.querySelector('#eliminar_cuenta');
    if ($deleteBtn) {
        $deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                //terminar
            }
        });
    }

    const $tabDatos = document.querySelector('#tab-datos');
    const $tabCompras = document.querySelector('#tab-compras');
    const $userCard = document.querySelector('#user-card-section');
    const $historyCard = document.querySelector('#history-card-section');

    function switchTab(tab) {
        if (window.innerWidth >= 900) return;

        if (tab === 'datos') {
            $tabDatos.classList.add('active');
            $tabCompras.classList.remove('active');
            $userCard.classList.remove('section-hidden-mobile');
            $historyCard.classList.add('section-hidden-mobile');
        } else {
            $tabCompras.classList.add('active');
            $tabDatos.classList.remove('active');
            $historyCard.classList.remove('section-hidden-mobile');
            $userCard.classList.add('section-hidden-mobile');
        }
    }

    if ($tabDatos && $tabCompras) {
        if (window.innerWidth < 900) {
            $historyCard.classList.add('section-hidden-mobile');
        }

        $tabDatos.addEventListener('click', () => switchTab('datos'));
        $tabCompras.addEventListener('click', () => switchTab('compras'));

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900) {
                $userCard.classList.remove('section-hidden-mobile');
                $historyCard.classList.remove('section-hidden-mobile');
            } else {
                if ($tabDatos.classList.contains('active')) {
                    switchTab('datos');
                } else {
                    switchTab('compras');
                }
            }
        });
    }
});
