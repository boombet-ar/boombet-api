const { chromium } = require('playwright');
const { verifyData } = require('../utils')
const sendWebhook = require('../utils/sendWebhook')

const executeScripts = require('../scripts/executeScripts');
const n8nWebhookUrl = process.env.WEBHOOK_URL
const afWebhook = process.env.AF_WEBHOOK
const scriptsList = require('../utils/provinceLists')

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



const registerCasino = async (req, res) => {
    const provincia = req.params.provincia //llega el alias de la provincia ej pba
    const nombreCasino = req.params.nombreCasino // debe llegar como por ej: sportsbetPba, bplayPba, etc
    const scriptCasino = require(`../scripts/${provincia}/${nombreCasino}`)
    const playerData = req.body

    const missingFields = verifyData(playerData, requiredFields)
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: "false",
            message: `Faltan datos: ${missingFields}`
        });
    }

    const browser = await chromium.launch({
        headless: true, // Cambia a false si querés ver el navegador. En n8n, dejar en true
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        proxy: {
            server: process.env.PROXY_IPROYAL_SERVER,
            username: process.env.PROXY_IPROYAL_USERNAME,
            password: process.env.PROXY_IPROYAL_PASSWORD
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
    });

    const page = await context.newPage();

    try {
        const responses = await scriptCasino(page, playerData)

        const success = !!responses;

        const webhookPayload = {
            playerData,
            responses
        }

        //No envia webhook

        return res.status(200).json({
            playerData,
            success,
            responses
        })

    } catch (err) { return res.status(500).json({ success: false, message: `Error al ejecutar script:${err.message}` }) }
    finally { await browser.close() }
}



const registerProvincia = async (req, res) => {
    const playerData = req.body
    const { provincia, tokenAfiliador } = req.params

    const provinceScripts = scriptsList[provincia]


    const missingFields = verifyData(playerData, requiredFields)
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: "false",
            message: `Faltan datos: ${missingFields}`
        });
    }


    try {
        const responses = await executeScripts(provinceScripts, playerData)

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


        if (tokenAfiliador) {
            const someoneIsOK = Object.values(responses).some(response => response.message === "OK") 
            if (someoneIsOK) {


                afPayload = { success: true, token: tokenAfiliador, playerData }

                sendWebhook(afWebhook, afPayload) 
                    .catch(err => {
                        console.error(`El webhook para ${tokenAfiliador} falló.`, err.message);

                    });

            }
        }



        return res.status(200).json({
            playerData,
            success,
            responses,
            tokenAfiliador
        })

    } catch (err) { return res.status(500).json({ success: false, message: `Error al ejecutar script:${err.message}` }) }
}




module.exports = { registerCasino, registerProvincia }