const { chromium } = require('playwright');
const bplayPba = require('./pba/bplayPba')
const sportsbetPba = require('./pba/sportsbetPba')
require('dotenv').config({ quiet: true });

/* DATOS DE EJEMPLO:
const playerData = { 
    nombre:"Raul",
    apellido:"Perez",
    email: "raulsito@gmail.com",
    telefono: "1112344321",
    genero: "MASCULINO", <-- siempre llega como sentencecase ('Masculino')
    fecha_nacimiento: "11-11-2003",
    dni: "45462226",
    cuit: "20-42532343-6",
    est_civil: "SOLTERO",
    calle: "CALLEFALSA",
    numCalle: "123",
    provincia: "Buenos Aires",
    ciudad: "MORENO",
    cp: 1234,
    user: "RaPe2312.32",
    password: "RaEz2312.31"
};
*/



const scriptPBA = async (playerData) => {

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

    const pageBplay = await context.newPage();
    const pageSportsbet = await context.newPage();
    //ACA SE AGREGAN MAS CASINOS

    try {
        
        const promises = [
            bplayPba(pageBplay, playerData), // <--- playerData llega desde una request http
            sportsbetPba(pageSportsbet, playerData)
            //ACA SE AGREGAN MAS CASINOS
        ]

        const results = await Promise.all(promises)

        const [resultadoBplay, resultadoSportsbet] = results; //ACA SE AGREGAN MAS CASINOS 

        return({
            bplay:resultadoBplay,
            sportsbet:resultadoSportsbet
            //ACA SE AGREGAN MAS CASINOS
        })

    } catch (error) {
        console.error('Error al ejecutar scripts:', error);
        return error;
    } finally {
        await browser.close();
    }
};


module.exports = scriptPBA