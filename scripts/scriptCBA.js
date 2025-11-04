const { chromium } = require('playwright');
const bplayCba = require('./cba/bplayCba')

require('dotenv').config({ quiet: true });


//CORDOBA

const scriptCBA = async (playerData) => {

    const browser = await chromium.launch({
        headless: false, // Cambia a false si querés ver el navegador. En n8n, dejar en true
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({/*  SACAR PROXY EN DESARROLLO
        proxy: { 
        server: process.env.PROXY_IPROYAL_SERVER,   
        username: process.env.PROXY_IPROYAL_USERNAME,
        password: process.env.PROXY_IPROYAL_PASSWORD
      },*/
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36', 
    });

    const pageBplay = await context.newPage();
    //ACA SE AGREGAN MAS CASINOS

    try {
        
        const promises = [
            bplayCba(pageBplay, playerData), // <--- playerData llega desde una request http


        ]

        const results = await Promise.all(promises)

        const [resultadoBplay] = results; //ACA SE AGREGAN MAS CASINOS 

        return({
            bplay:resultadoBplay,
            //ACA SE AGREGAN MAS CASINOS
        })

    } catch (error) {
        console.error('Error al ejecutar scripts:', error);
        return error;
    } finally {
        await browser.close();
    }
};


module.exports = scriptCBA