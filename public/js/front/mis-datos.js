import { Menu } from "../components/navigation/menu.js";
import { Footer } from '../components/navigation/footer.js';
import { UserTools } from "../components/user/user-tools.js";
import { User } from "../models/user.js";

document.addEventListener('turbo:load', () => {
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

    function updateProfileUI(user) {
        if (user.FOTO && user.FOTO !== "null") {
            $previewImage.style.backgroundImage = `url(${user.FOTO})`;
        } else {
            $previewImage.style.backgroundImage = `url('../img/icons/sin-foto.svg')`;
        }
    }

    updateProfileUI(user);

    window.addEventListener('userUpdated', (e) => {
        updateProfileUI(e.detail);
    });

    if ($imageContainer) {
        $imageContainer.addEventListener('click', () => {
            $fileInput.click();
        });
    }

    if ($fileInput) {
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
    }

    if ($saveBtn) {
        $saveBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const file = $fileInput.files[0];
            if (!file) return;

            $saveBtn.textContent = 'Subiendo...';
            $saveBtn.disabled = true;

            const formData = new FormData();
            formData.append('FOTO', file);
            formData.append('type', 'profile');
            formData.append('id', user.ID);

            try {
                const response = await fetch(`/api/update/profile`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    user.FOTO = data.foto;
                    localStorage.removeItem('user');
                    localStorage.setItem('user', JSON.stringify(user));
                    const timestamp = new Date().getTime();
                    $previewImage.style.backgroundImage = `url('${user.FOTO}?t=${timestamp}')`;

                    $saveBtn.style.display = 'none';
                    $saveBtn.disabled = false;
                    $uploadStatus.innerHTML = '<span class="mensaje-foto-upload">¡Foto actualizada correctamente!</span>';

                    window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
                    setTimeout(() => { $uploadStatus.innerHTML = ''; }, 3000);
                } else {
                    throw new Error(data.message || 'Error al subir la imagen');
                }
            } catch (error) {
                console.error('Upload error:', error);
                $saveBtn.textContent = 'Reintentar';
                $saveBtn.disabled = false;
                $uploadStatus.innerHTML = '<span class="mensaje-foto-upload">Error al actualizar la foto.</span>';
            }
        });
    }

    const $deleteBtn = document.querySelector('#eliminar_cuenta');
    if ($deleteBtn) {
        $deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                // Implement account deletion logic here if needed
                alert('Funcionalidad de eliminar cuenta en desarrollo.');
            }
        });
    }
});
