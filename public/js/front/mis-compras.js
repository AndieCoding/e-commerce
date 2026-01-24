import { Menu } from "../components/navigation/menu.js";
import { Footer } from '../components/navigation/footer.js';
import { HistorialFacturas } from "../components/user/historial-facturas.js";
import { User } from "../models/user.js";

document.addEventListener('turbo:load', () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const user = new User(userData);
    if (!userData || !user) {
        window.location.href = '/login';
        return;
    }
});
