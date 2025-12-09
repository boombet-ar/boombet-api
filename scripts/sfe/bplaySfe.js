const { toTitleCase, toSentenceCase, status } = require('../../utils')

const pageUrl = process.env.BPLAY_SFE_URL

const bplaySfe = async (page, playerData) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const {
        nombre,
        apellido,
        email,
        telefono,
        genero,
        fecha_nacimiento,
        dni,
        cuit,
        est_civil,
        calle,
        numCalle,
        provincia,
        ciudad,
        cp,
        user,
        password
    } = playerData;

    const fecha = fecha_nacimiento.split('-')
    const dia = fecha[0]
    const mes = fecha[1]
    const mesNumero = parseInt(mes, 10)
    const mesIndex = mesNumero - 1
    const nombreMes = meses[mesIndex]
    const año = fecha[2]
    const codArea = telefono.slice(0, 2);
    const numero = telefono.slice(2);

    const generoId = genero == "Masculino" ? '1' : '2'



    try {

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


        //Entrar a pag de login
        await page.goto(pageUrl, { //Bplay
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        //Esperar al campo de usuario


        await page.waitForSelector('input[name="name"]', { timeout: 30000 });
        await page.type('input[name="name"]', nombre, { delay: 100 }); //Nombre

        await page.type('input[name="middlename"]', apellido, { delay: 100 }); //Apellido


        await page.type('input[name="e_mail"]', email, { delay: 100 }); //Email
        await page.type('input[name="phone-number1"]', codArea, { delay: 100 }); //Cod.Area
        await page.type('input[name="phone-number2"]', numero, { delay: 100 }); //Telefono

        await page.locator('[aria-labelledby="select2-gender-container"]').click();
        await page.getByRole('option', { name: genero }).click();//Genero

        await page.locator('[aria-labelledby="select2-day-container"]').click();
        await page.getByRole('option', { name: dia }).click(); //Dia de nacimiento 

        await page.locator('[aria-labelledby="select2-month-container"]').click();
        await page.getByRole('option', { name: nombreMes }).click(); //Mes de nacimiento 

        await page.locator('[aria-labelledby="select2-year-container"]').click();
        await page.getByRole('option', { name: año }).click(); //Año de nacimiento 


        try {

            await page.getByText('ya está registrado').waitFor({ state: 'visible', timeout: 10000 });
            console.log('jugador previamente afiliado');
            return (status.previamenteAfiliado);

        } catch (error) {/*Si no estaba previamente afiliado, no hace nada*/ }

        await page.locator('#step1to2').click(); //CLICK AL PASO SIGUIENTE  

        //Completar formulario (Paso 2)
        await page.waitForTimeout(1000)


        const splittedCuit = cuit.split('-')


        await page.locator('#nationalId').fill(dni) //DNI

        await page.locator('#cuit1').fill(splittedCuit[0])
        await page.locator('#cuit2').fill(splittedCuit[1]) //CUIT
        await page.locator('#cuit3').fill(splittedCuit[2])

        await page.locator('[aria-labelledby="select2-maritalStatus-container"]').click();
        await page.getByRole('option', { name: toSentenceCase(est_civil) }).click(); //Estado civil

        await page.locator('[aria-labelledby="select2-profession-container"]').click();
        await page.getByRole('option', { name: 'Empleado', exact: true }).click(); //Profesion (empleado por default)


        await page.locator('#addr-street').fill(calle) //calle
        await page.locator('#addr-number').fill(numCalle) //numero

        try {

            await page.getByText('ya está registrado').waitFor({ state: 'visible', timeout: 10000 });
            console.log('jugador previamente afiliado');
            return (status.previamenteAfiliado);

        } catch (error) { }
        // --- SELECCIÓN DE PROVINCIA---

        const provinciaID = 441 // Usando el ID fijo para que el Select oculto tenga valor
        const provinciaNombre = provincia //toTitleCase(provincia).trim();
        const ciudadASeleccionar = ciudad.toUpperCase().trim();


        await page.evaluate((id) => {
            const sel = document.getElementById('state');
            sel.value = id;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sel.dispatchEvent(new Event('blur', { bubbles: true }));
        }, provinciaID);



        await page.locator('[aria-labelledby="select2-state-container"]').click();
        await page.getByPlaceholder('Buscar').fill(provinciaNombre)
        await page.getByRole('option', { name: provinciaNombre, exact: false }).click(); //Provincia (Ver caso Bs.as / Ciudad de bs.as)

     
        await page.locator('[aria-labelledby="select2-city-container"]').click();
        await page.getByPlaceholder('Buscar').fill(ciudad)
        await page.getByRole('option', { name: ciudad.toUpperCase(), exact: true }).click(); 
       

    

        await page.locator('[aria-labelledby="select2-zipcode-container"]').click();
        await page.getByPlaceholder('Buscar').fill(cp.toString())
        await page.getByRole('option', { name: cp, exact: true }).click(); 
        

        await page.locator('#step2to3').click();
        /// PASO FINAL
        await page.locator('#user').fill(user)
        await page.locator('#pwdField').fill(password)
        await page.locator('#re_password').fill(password)
        await page.locator('#expuesta_2').click();
        await page.locator('#prohibicion').click();
        await page.locator('#c18old').click();
        await page.locator('#step3toSubmit').click();

        await page.waitForTimeout(30000)

        console.log("OK")
        return (status.ok("https://santafe.bplay.bet.ar/?login=true"))

    } catch (error) {
        return (status.error(error.message))
    }
}

module.exports = bplaySfe;