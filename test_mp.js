import fetch from 'node-fetch';

async function test() {
    const response = await fetch('http://localhost:3000/api/payments/mp/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [{ id: 1, cantidad: 1 }],
            guestUser: { email: 'test@test.com', nombre: 'Test' }
        })
    });
    console.log(response.status);
    console.log(await response.text());
}
test();
