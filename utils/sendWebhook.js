
// Cambié el nombre a algo más descriptivo
async function sendWebhook(webhookURL, payload) {
    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Webhook enviado exitosamente:', response.status);
        } else {
            console.error('El servidor del webhook respondió con un error:', response.status);
        }
    } catch (error) {
        console.error('Error de red al enviar webhook:', error.message);
        throw error; 
    }
}

module.exports = sendWebhook;