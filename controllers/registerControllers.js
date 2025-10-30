const { verifyData } = require('../utils')
const sendWebhook = require('../utils/sendWebhook')
const scriptPBA = require('../scripts/scriptPBA')
const n8nWebhookUrl = 'http://localhost:5678/webhook-test/c9018e16-04a8-4136-835e-c1b7a3b46b53' //PASAR A .env

const registerPBA = async (req, res) => {
    const playerData = req.body

    const requiredFields = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'genero',
        'fecha_nacimiento',
        'dni',
        'cuit',
        'est_civil',
        'calle',
        'numCalle',
        'provincia',
        'ciudad',
        'cp',
        'user',
        'password'
    ];

    const missingField = verifyData(playerData, requiredFields)
    if (missingField) {
        res.status(400).json({
            success: "false",
            message: `Falta el dato: ${missingField}`
        });
    }
    // esta verificación hay que hacerla, pero habria que investigar como hacerla
    //sin tener que pasarle 200 elementos al array. por ahora sirve


    try {
        const responses = await scriptPBA(playerData)

        const success = !!responses;

        const webhookPayload = {
            playerData,
            responses
        }

        if (success) {
            sendWebhook(n8nWebhookUrl, webhookPayload)
                .catch(err => {
                    console.error(`El webhook para ${playerData.dni} falló.`, err.message);
                });
        }

        return res.status(200).json({
            playerData,
            success,
            responses
        })

    } catch (err) { return res.status(500).json({ success: false, message: `Error al ejecutar script:${err.message}` }) }
}

module.exports = { registerPBA }