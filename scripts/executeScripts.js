const { chromium } = require('playwright');
const { status } = require('../utils'); // Importamos status desde utils
const playwrightHeadless = process.env.PLAYWRIGHT_HEADLESS
require('dotenv').config({ quiet: true });

// Función auxiliar para manejar los reintentos
const runWithRetry = async (scriptFunc, context, playerData, maxRetries) => {
    let attempt = 0;
    let result;

    while (attempt <= maxRetries) {
        let page = null;
        try {
            // CREAMOS UNA PESTAÑA NUEVA PARA ESTE INTENTO
            page = await context.newPage();

            // Ejecutamos el script pasándole la página nueva
            result = await scriptFunc(page, playerData);

            if (result && result.success) {
                // Opcional: Cerrar la página si terminó bien
                // await page.close(); 
                return result;
            }

            console.log(`⚠️ Intento ${attempt + 1} fallido.`);
            // Si falló por lógica, cerramos la página
            await page.close().catch(() => {}); 

        } catch (error) {
            console.error(`❌ Error (crash) en intento ${attempt + 1}:`, error);
            
            // Aseguramos limpieza
            if (page) await page.close().catch(() => {});
            
            // USAMOS EL HELPER DE UTILS EN LUGAR DE HARDCODEAR
            result = status.error(error.message); 
        }

        attempt++;
        
        if (attempt <= maxRetries) {
            console.log(`🔄 Reintentando... (${attempt}/${maxRetries})`);
            await new Promise(res => setTimeout(res, 1000));
        }
    }

    return result;
};

const executeScripts = async (scripts, playerData) => { 

    const browser = await chromium.launch({
        headless: playwrightHeadless === 'false' ? false : true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log(playwrightHeadless)

    const context = await browser.newContext({
        proxy: {
            server: process.env.PROXY_IPROYAL_SERVER,
            username: process.env.PROXY_IPROYAL_USERNAME,
            password: process.env.PROXY_IPROYAL_PASSWORD
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
    });

    try {
        const results = await Promise.all(
            scripts.map((scriptFunc) => runWithRetry(scriptFunc, context, playerData, 2))
        );

        const resultados = Object.fromEntries(
            scripts.map((f, i) => [f.name || `script${i + 1}`, results[i]])
        );

        return resultados;

    } catch (error) {
        return error
    } finally {
        await browser.close();
    }
};

process.on('message', async (message) => {
    const { scripts, playerData } = message
    
    const functions = scripts.map(s => {
        return require(s)
    })

    try {
        const responses = await executeScripts(functions, playerData);

        process.send({ type: 'success', payload: responses }); 

    } catch (error) {
        console.error('Error en el proceso hijo al ejecutar Playwright:', error);
        process.send({ type: 'error', payload: error.message || 'Error desconocido' });

    } finally {
        process.disconnect();
    }
});

module.exports = executeScripts