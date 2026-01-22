import { Menu } from "../components/navigation/menu.js";
import { Footer } from '../components/navigation/footer.js';
import { User } from "../models/user.js";

document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        window.location.href = '/login';
        return;
    }
    const user = new User(userData);
    if (!user || user == null) {
        window.location.href = '/login';
        return;
    }

    if (user.TIPO === 'ad') {
        const quickLinksContainer = document.querySelector('.quick-links-mobile');
        if (quickLinksContainer) {
            const adminLink = document.createElement('a');
            adminLink.href = '/panel';
            adminLink.className = 'quick-link';
            adminLink.innerHTML = `
                <span class="icon">⚙️</span>
                <span class="text">Panel de Control</span>
                <span class="arrow">›</span>
            `;
            quickLinksContainer.insertBefore(adminLink, quickLinksContainer.firstChild);
        }
    }

    if (user.FOTO && user.FOTO !== "null") {
        const misDatosLink = document.querySelector('#link-mis-datos .icon');
        if (misDatosLink) {
            misDatosLink.innerHTML = `<img src="${user.FOTO}" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            misDatosLink.style.display = 'flex';
            misDatosLink.style.justifyContent = 'center';
            misDatosLink.style.alignItems = 'center';
            misDatosLink.style.overflow = 'hidden';
            misDatosLink.style.padding = '0';
            misDatosLink.style.width = '50px'; // Ensure consistent size
            misDatosLink.style.height = '50px';
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/logout', { method: 'POST' });
                // Check for JSON response indicating success
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }
});
