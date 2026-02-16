export async function initTicket() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    const ticketId = urlParams.get('id');
    const container = document.getElementById('ticket-container');

    if (!container) return;

    if (!ticketId) {
        container.innerHTML = '<h3>No se especificó un número de ticket.</h3>';
        return;
    }

    try {
        const response = await fetch(`/api/compras_usuario/${ticketId}`);

        if (!response.ok) {
            throw new Error('No se pudo encontrar el ticket');
        }

        const ticketData = await response.json();

        container.innerHTML = '';
        const ticketElement = document.createElement('order-ticket');
        ticketElement.data = ticketData;
        container.appendChild(ticketElement);

    } catch (error) {
        console.error('Error fetching ticket:', error);
        container.innerHTML = `<h3>Error al cargar el ticket: ${error.message}</h3>`;
    }
}
