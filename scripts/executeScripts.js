const { chromium } = require('playwright');

require('dotenv').config({ quiet: true });



//CONCURRENCIA: Usar child_process, send() ,on(), fork() etc



//executescripts deberia ser el proceso forkeado. el controller deberia ser el padre


const executeScripts = async (scripts, playerData) => { // array con rutas de scripts de una provincia y playerData

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



    const pages = await Promise.all(     //Crear una pestaña para cada script
        scripts.map(() => context.newPage())
    );


    try {

        const results = await Promise.all(
            scripts.map((scriptFunc, i) => scriptFunc(pages[i], playerData))
        );


        const resultados = Object.fromEntries(
            scripts.map((f, i) => [f.name || `script${i + 1}`, results[i]])
        );

        return resultados;


    } catch (error) {
        console.error('Error al ejecutar scripts:', error);
        return error;
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