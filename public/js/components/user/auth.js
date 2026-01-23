async function checkAuthState() {
    try {
        const response = await fetch('/api/me');
        const auth = await response.json();

        const authContainer = document.getElementById('auth-container');

        if (auth.logged) {
            renderUserMenu(auth.user, authContainer);
            sessionStorage.setItem('userId', auth.user.id);
        } else {
            renderLoginButtons(authContainer);
            sessionStorage.removeItem('userId');
        }
    } catch (error) {
        console.error("Error al verificar autenticación", error);
    }
}

function renderUserMenu(user, container) {
    container.innerHTML = `
        <div class="user-menu">
            <span>Hola, <strong>${user.name}</strong></span>
            <a href="/perfil" class="btn-perfil">Mi Cuenta</a>
            <a href="/logout" class="btn-logout">Cerrar Sesión</a>
        </div>
    `;
}

function renderLoginButtons(container) {
    container.innerHTML = `
        <a href="/login" class="btn-login">Iniciar Sesión</a>
        <a href="/auth/google" class="btn-google">Entrar con Google</a>
    `;
}


document.addEventListener('DOMContentLoaded', checkAuthState);