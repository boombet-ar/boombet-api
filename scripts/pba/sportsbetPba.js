const { toTitleCase, toSentenceCase, status } = require('../../utils')

const Captcha = require('@2captcha/captcha-solver')
require('dotenv').config({ quiet: true });

const captchaApiKey = process.env.CAPTCHA_API_KEY;

const solver = new Captcha.Solver(captchaApiKey)

const pageUrl = process.env.SPORTSBET_PBA_URL

const sportsbetPba = async (page, playerData) => {
    const {
        email,
        genero,
        fecha_nacimiento,
        telefono,
        dni,
        password
    } = playerData;
    const fecha = fecha_nacimiento.replaceAll('-', '')
    const codArea = telefono.slice(0, 2);
    const numero = telefono.slice(2);

    try {


        //Optimizacion de recursos: no descarga multimedia
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            const url = route.request().url();

            if (
                ['image', 'font', 'media'].includes(resourceType) ||
                url.includes('google-analytics.com') ||
                url.includes('googletagmanager.com')
            ) {
                return route.abort();
            }
            
            return route.continue();
        });



        await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 35000,
        });

        await page.locator('#documentNumber').fill(dni);

        await page.locator('#sex').selectOption(toSentenceCase(genero));

        await page.locator('#BirthDate').fill(fecha);
        await page.locator('#BirthDate').press('Escape');

        await page.locator('#AreaCode').fill(codArea)
        await page.locator('#PhoneNumber').fill(numero)

        await page.locator('#Email').fill(email)
        await page.locator('#ConfirmEmail').fill(email)

        await page.locator('#Password').fill(password)
        await page.locator('#ConfirmPassword').fill(password)


        //await page.locator('[onclick="togglePassword(\'Password\')"]').click();

        await page.locator('.checkmark').click()


        const res = await solver.recaptcha({
            pageurl: pageUrl,
            googlekey: '6LfxRP4kAAAAAMl9eIBuLj9fxXCS7dICmuTZFmBp' //ES EL 'ID' DEL CAPTCHA
        });

        const captchaToken = res.data;
        if (!captchaToken) {
        const err = 'No se pudo obtener el token de 2captcha.'
        return(status.error(err))
        }


        //Inyectar el token 
        const recaptchaTextarea = await page.locator('#g-recaptcha-response');
        await recaptchaTextarea.evaluate(element => element.style.display = 'block');
        await recaptchaTextarea.fill(captchaToken);
        await recaptchaTextarea.dispatchEvent('change');




        const botonSiguiente = await page.locator('#btnNext');

        await botonSiguiente.evaluate(element => element.removeAttribute('disabled'));
        await botonSiguiente.click();

        try {
            const errorMessage = await page.locator('span', { hasText: 'No pudimos validar tus datos' });
            await errorMessage.waitFor({ state: 'visible', timeout: 8000 });

            console.log('Error al afiliar: Verificar DNI y género');
            const err = "Verificar DNI y género";
            return(status.error(err))
        } catch { }

        try {

            await page.getByText('Ya existe').waitFor({ state: 'visible', timeout: 8000 });
            console.log('Jugador previamente afiliado');
            return (status.previamenteAfiliado);

        } catch (error) {/*Si no estaba previamente afiliado, no hace nada*/ }


        console.log("OK")
        return (status.ok("https://pba.sportsbet.bet.ar/"))
    } catch (error) {
        console.log('❌ Error: ', error);
        return(status.error(error.message))
    }

}

module.exports = sportsbetPba