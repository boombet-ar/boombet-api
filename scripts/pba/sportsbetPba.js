const { toTitleCase, toSentenceCase, status } = require('../../utils')
const Captcha = require('@2captcha/captcha-solver')
require('dotenv').config({ quiet: true });

// CONFIGURACIÓN
const captchaApiKey = process.env.CAPTCHA_API_KEY;
const solver = new Captcha.Solver(captchaApiKey);
const pageUrl = process.env.SPORTSBET_PBA_URL;

// NOTA: Asegúrate de que este SITEKEY sea el que está dentro del div class="cf-turnstile"
const SITEKEY_REAL = '0x4AAAAAACDhk5AWtW4vfmoE';
const ACTION_REAL = 'register';

// Proxy Helper
const getProxyFor2Captcha = () => {
    try {
        const serverUrl = process.env.PROXY_IPROYAL_SERVER || '';
        const username = process.env.PROXY_IPROYAL_USERNAME;
        const password = process.env.PROXY_IPROYAL_PASSWORD;
        // Limpieza básica por si la variable de entorno trae protocolo
        const cleanServer = serverUrl.replace('http://', '').replace('https://', '');
        return `${username}:${password}@${cleanServer}`;
    } catch (e) { return null; }
};

const sportsbetPba = async (page, playerData) => {
    const { email, genero, fecha_nacimiento, telefono, dni, password } = playerData;
    const fecha = fecha_nacimiento.replaceAll('-', '')
    const codArea = telefono.slice(0, 2);
    const numero = telefono.slice(2);

    try {

        // 1. OBTENER USER-AGENT REAL (CRÍTICO PARA TURNSTILE)
        const realUserAgent = await page.evaluate(() => navigator.userAgent);

        // Listener para detectar bloqueos de Cloudflare (401/403)
        page.on('response', response => {
            if (response.url().includes('challenges.cloudflare.com') && [401, 403].includes(response.status())) {
                console.log("⚠️ ALERTA: Cloudflare rechazó la conexión (Bot detectado).");
            }
        });

        await page.route('**/*', route => {
            const resourceType = route.request().resourceType();
            if (['image', 'media', 'font'].includes(resourceType)) {
                // Ojo: A veces bloquear stylesheet rompe el layout del captcha. 
                // Si el captcha no se ve, quita 'stylesheet' de esta lista.
                return route.abort();
            }
            return route.continue();
        });
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Ahora esperamos explícitamente a que el formulario sea visible
        console.log("Esperando formulario...");
        try {
            // Esperamos a que aparezca el campo DNI, eso confirma que la página cargó lo importante
            await page.waitForSelector('#documentNumber', { state: 'visible', timeout: 30000 });
        } catch (e) {
            console.log("⚠️ No cargó el formulario rápido, recargando página...");
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.waitForSelector('#documentNumber', { state: 'visible', timeout: 30000 });
        }
        // Llenado de formulario
        await page.locator('#documentNumber').fill(dni);
        await page.locator('#sex').selectOption(toSentenceCase(genero));
        await page.locator('#BirthDate').fill(fecha);
        await page.locator('#BirthDate').press('Escape'); // Cerrar datepicker si estorba
        await page.locator('#AreaCode').fill(codArea);
        await page.locator('#PhoneNumber').fill(numero);
        await page.locator('#Email').fill(email);
        await page.locator('#ConfirmEmail').fill(email);
        await page.locator('#Password').fill(password);
        await page.locator('#ConfirmPassword').fill(password);

        const checkAffiliate = async() => {
        if (await page.getByText("Ya existe").isVisible()) {
            console.log(status.previamenteAfiliado)
            return status.previamenteAfiliado
        }else if (await page.getByText("Atención").isVisible()) {
            return status.error("Error en datos o al ejecutar")
        } }

        


        // Click en términos y condiciones
        await page.locator('.checkmark').click();

        checkAffiliate();
        // =============================================================================
        // PASO 1 y 2 (DOCS): SOLICITUD A 2CAPTCHA
        // =============================================================================

        // Esperamos a que el widget aparezca en el DOM antes de pedir el token
        // Esto simula el comportamiento humano de "ver" el captcha primero.
        try {
            await page.waitForSelector('.cf-turnstile', { state: 'attached', timeout: 10000 });
        } catch (e) {
            console.log("⚠️ No se detectó el widget .cf-turnstile (¿Quizás no cargó o es invisible?)");
        }

        const proxyString = getProxyFor2Captcha();

        // La librería hace el POST a in.php y el GET a res.php automáticamente
        const res = await solver.cloudflareTurnstile({
            pageurl: pageUrl,
            sitekey: SITEKEY_REAL,
            action: ACTION_REAL,
            data: ACTION_REAL, // A veces 'data' se usa para el action también
            userAgent: realUserAgent, // CRÍTICO: Debe coincidir con el navegador
            proxy: proxyString,
            proxytype: 'HTTP'
        });

        const captchaToken = res.data;
        if (!captchaToken) throw new Error('2Captcha no devolvió token');

        console.log('✅ Token recibido de 2Captcha.');

        // =========================================================================
        // PASO 3 (DOCS): INYECCIÓN DEL RESULTADO
        // =========================================================================

        await page.evaluate((token) => {
            // Función auxiliar para forzar el valor en React/Angular
            function setNativeValue(element, value) {
                const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                const prototype = Object.getPrototypeOf(element);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value").set;

                if (valueSetter && valueSetter !== prototypeValueSetter) {
                    prototypeValueSetter.call(element, value);
                } else {
                    valueSetter.call(element, value);
                }

                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 1. Buscamos el input estándar de Turnstile
            let inputCF = document.querySelector('[name="cf-turnstile-response"]');

            // 2. Buscamos el input de fallback (compatibilidad)
            let inputG = document.querySelector('[name="g-recaptcha-response"]');

            if (inputCF) {
                inputCF.value = token; // Asignación directa
                setNativeValue(inputCF, token); // Asignación React
            }

            if (inputG) {
                console.log("Setting g-recaptcha-response");
                inputG.value = token;
                setNativeValue(inputG, token);
            }

            // 3. (OPCIONAL) Si el sitio usa callback global
            // Muchos sitios modernos usan window.turnstile.render con callback interno
            // y no exponen una función global. Pero si existe, la llamamos:
            if (typeof window.onTurnstileSuccess === 'function') {
                window.onTurnstileSuccess(token);
            }

            // 4. Hack para sitios muy modernos: 
            // A veces el token se guarda en un objeto interno de cloudflare.
            // Si window.turnstile existe, intentamos inyectar (esto es experimental)
            if (window.turnstile) {
                try {
                    // Esto fuerza al widget a creer que está resuelto si el frontend lo permite
                    const container = document.querySelector('.cf-turnstile');
                    if (container && container.id) {
                        // A veces resetear antes ayuda, pero cuidado con borrar el token
                    }
                } catch (e) { }
            }

        }, captchaToken);

        // Espera breve para que el frontend procese el evento 'change'
        await page.waitForTimeout(1000);

        // =========================================================================
        // CLICK / SUBMIT
        // =========================================================================
        const botonSiguiente = page.locator('#btnNext');

        // Verificamos si el botón se habilitó
        if (await botonSiguiente.isEnabled()) {
            await botonSiguiente.click();
        } else {

            // Forzar submit dispara el envío aunque el botón esté gris
            await page.evaluate(() => {
                const btn = document.querySelector('#btnNext');
                if (btn) {
                    // Quitamos atributo disabled por si acaso visualmente molesta
                    btn.removeAttribute('disabled');
                    btn.click();
                } else {
                    // Fallback a form submit
                    document.querySelector('form')?.requestSubmit();
                }
            });
        }
        checkAffiliate();
        // ESPERA DE RESULTADO
        try {
            await page.waitForTimeout(5000);
        } catch (e) { }

        // --- INICIO DE BLOQUE PROTEGIDO ---
        try {
            // 1. Verificamos si el navegador sigue vivo antes de consultar nada
            if (page.isClosed()) {
                console.log("⚠️ El navegador se cerró inesperadamente.");
                // Si se cerró justo después del submit, a veces es éxito, a veces no. 
                // Ante la duda, devolvemos error o un estado especial.
                return status.error("El navegador se cerró antes de confirmar.");
            }

            // 2. Comprobación de errores generales visibles
            // Usamos un try interno por si el elemento desaparece mientras lo leemos
            const hayErrorVisible = await page.getByText('Error').isVisible().catch(() => false) || 
                                    await page.getByText('Problema').isVisible().catch(() => false);

            if (hayErrorVisible) {
                console.log("❌ Error 'Atención' detectado en el sitio.");
                return status.error("Error al afiliar. Revisa los datos");
            }

            // 3. Verificamos nuevamente con la función auxiliar
            // Le pasamos un flag o hacemos el try-catch aquí mismo para que no explote
            try {
                 resultadoCheck = await checkAffiliate();
                 if (resultadoCheck) return resultadoCheck;
            } catch (err) {
                // Si falla checkAffiliate porque la pagina se cerró, lo ignoramos o devolvemos error
                console.log("⚠️ No se pudo verificar afiliación final (contexto cerrado): " + err.message);
            }

            await page.waitForTimeout()
            // Si sobrevivió a todo lo anterior y no hay errores:
            return status.ok("https://pba.sportsbet.bet.ar/");

        } catch (error) {
            // Este catch captura si el navegador se cierra EN MEDIO de las verificaciones de arriba
            if (error.message.includes('Target page, context or browser has been closed')) {
                console.log("⚠️ Error crítico: El navegador murió durante la verificación final.");
                return status.error("Conexión perdida con el navegador.");
            }
            throw error; // Si es otro error, que lo maneje el catch principal
        }
        // --- FIN DE BLOQUE PROTEGIDO ---

    } catch (error) {
        console.log('❌ Error General: ', error);
        return status.error(error.message);
    }
}
module.exports = sportsbetPba;