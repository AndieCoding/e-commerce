import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
export async function resumenMail(ticket, user) {
    const { nombre, email } = user;
    if (!ticket) {
        console.error('Ticket data missing for email');
        return;
    }
    try {
        const subject = `El Fan del Mate - Resumen de compra #${ticket.n_fac}`;
        const detalleHtml = ticket.detalle.map(product => `
            <div style="align-items: center; margin-bottom: 10px;">
                <img src="${product.imagen}" alt="${product.nombre}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                <span>
                    <strong>${product.nombre}</strong> x ${product.cantidad} = $${product.subtotal}
                </span>
            </div>
        `).join('');
        const html = `                        
            <p>Tu número de ticket es <strong>#${ticket.n_fac}</strong>.</p>
            <p>Detalle:</p>
            ${detalleHtml}
            <p><strong>Total a pagar:</strong> $${ticket.total}</p>
            <hr>
            <a href="https://tienda-mate.vercel.app/mis_compras">Ver resumen de compra</a>
            <p>Si elegiste abonar con transferencia, por favor envía el comprobante respondiendo a este correo o por WhatsApp al +54 3462 336880.</p>
        `;

        const mailOptionsClient = {
            from: `"Fan del Mate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `<h3>Hola ${nombre}, gracias por tu compra</h3>${html}`
        };

        const mailOptionsAdmin = {
            from: `"Fan del Mate" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Nueva Venta - #${ticket.n_fac}`,
            html: `
                <h3>Nueva Venta</h3>
                <p><strong>Cliente:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>                
                <p><strong>Ticket:</strong> #${ticket.n_fac}</p>
                <p>Detalle:</p>
                ${detalleHtml}
                <p><strong>Total a pagar:</strong> $${ticket.total}</p>
                <a href="https://tienda-mate.vercel.app/panel-informes">Ir a la tienda</a>
            `
        };

        await Promise.all([
            transporter.sendMail(mailOptionsClient),
            transporter.sendMail(mailOptionsAdmin)
        ]);

        console.log('\n Emails enviados a comprador y vendedor.\n');

    } catch (error) {
        console.error('Error sending email:', error);
    }
};
