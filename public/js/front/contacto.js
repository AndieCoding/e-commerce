document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formularioContacto');
    const statusDiv = document.getElementById('estadoFormulario');
    const submitBtn = document.getElementById('botonEnviar');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset status
        statusDiv.innerHTML = '';
        statusDiv.style.color = 'inherit';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            asunto: document.getElementById('asunto').value,
            mensaje: document.getElementById('mensaje').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                statusDiv.innerHTML = '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.';
                statusDiv.style.color = 'green';
                form.reset();
            } else {
                statusDiv.innerHTML = result.message || 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.';
                statusDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            statusDiv.innerHTML = 'Error de conexión. Por favor, verifica tu internet.';
            statusDiv.style.color = 'red';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Mensaje';
        }
    });
});
