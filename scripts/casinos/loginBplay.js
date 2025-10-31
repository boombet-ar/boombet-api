const { toTitleCase, toSentenceCase,status} = require('../../utils')

const loginBplay = async (page, playerData) => {
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

const pageUrl = process.env.BPLAY_PBA_URL


  try {
    
    //Entrar a pag de login
    await page.goto(pageUrl, { //Bplay
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    //Esperar al campo de usuario
    await page.waitForSelector('input[name="name"]', { timeout: 30000 });


    //Completar formulario (Paso 1)
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
      return(status.previamenteAfiliado);

    } catch (error) {/*Si no estaba previamente afiliado, no hace nada*/ }

    await page.locator('#step1to2').click(); //CLICK AL PASO SIGUIENTE  


    //Completar formulario (Paso 2)
    await page.waitForTimeout(1000)

    await page.locator('#nationalId').fill(dni) //DNI

    const splittedCuit = cuit.split('-')
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
      return(status.previamenteAfiliado);

    } catch (error){}
    // --- SELECCIÓN DE PROVINCIA---

    const provinciaID = 441 // Usando el ID fijo para que el Select oculto tenga valor
    const provinciaNombre = toTitleCase(provincia).trim();
    const ciudadASeleccionar = ciudad.toUpperCase().trim();

    await page.evaluate((id) => {
      const sel = document.getElementById('state');
      sel.value = id;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sel.dispatchEvent(new Event('blur', { bubbles: true }));
    }, provinciaID);

    await page.locator('[aria-labelledby="select2-state-container"]').click();
    await page.getByRole('option', { name: provinciaNombre, exact: true }).click(); //Provincia (Ver caso Bs.as / Ciudad de bs.as)

    // --- INYECCIÓN FORZADA DE CIUDAD ---

    await page.evaluate((datos) => {
      const { ciudad } = datos;

      const selCiudad = document.getElementById('city'); // ID del SELECT oculto de la ciudad
      const spanCiudad = document.querySelector('#select2-city-container');

      if (selCiudad) {
        // A. HACER QUE LA OPCIÓN EXISTA: Si la API no cargó la ciudad, la creamos en el SELECT.
        if (!selCiudad.querySelector(`option[value="${ciudad}"]`)) {
          // Creamos la opción (valor=texto, texto=texto, seleccionada, actual)
          // Se asume que el valor de la opción es igual al texto (nombre de la ciudad)
          const newOption = new Option(ciudad, ciudad, true, true);
          selCiudad.appendChild(newOption);
        }

        // B. Establecer el valor de la Ciudad
        selCiudad.value = ciudad;

        // C. Forzar el evento de cambio y blur para pasar la validación
        selCiudad.dispatchEvent(new Event('change', { bubbles: true }));
        selCiudad.dispatchEvent(new Event('blur', { bubbles: true }));

        // D. Sincronizar el Select2 visible de la Ciudad
        if (spanCiudad) spanCiudad.textContent = ciudad;
        if (window.jQuery) {
          // Esto es solo para asegurar que visualmente se vea bien
          window.jQuery(selCiudad).trigger('change.select2');
        }
      }

    }, { ciudad: ciudadASeleccionar });


    // INYECCION FORZADA DE CP

    await page.evaluate((datos) => {
      const { cp } = datos;

      const selCp = document.getElementById('zipcode'); // ID del SELECT oculto 
      const spanCp = document.querySelector('#select2-zipcode-container');

      if (selCp)
        // A. HACER QUE LA OPCIÓN EXISTA: Si la API no cargó el cp, lo creamos en el SELECT.
        if (!selCp.querySelector(`option[value="${cp}"]`)) {
          // Creamos la opción (valor=texto, texto=texto, seleccionada, actual)
          // Se asume que el valor de la opción es igual al texto (nombre de la ciudad)
          const newOption = new Option(cp, cp, true, true);
          selCp.appendChild(newOption);
        }

      // B. Establecer el valor de la Ciudad
      selCp.value = cp;

      // C. Forzar el evento de cambio y blur para pasar la validación
      selCp.dispatchEvent(new Event('change', { bubbles: true }));
      selCp.dispatchEvent(new Event('blur', { bubbles: true }));

      // D. Sincronizar el Select2 visible
      if (spanCp) spanCp.textContent = cp;
      if (window.jQuery) {
        window.jQuery(selCp).trigger('change.select2');
      }
    }

      , { cp: cp });




    await page.locator('#step2to3').click();
    /// PASO FINAL
    await page.locator('#user').fill(user)
    await page.locator('#pwdField').fill(password)
    await page.locator('#re_password').fill(password)
    await page.locator('#expuesta_2').click();
    await page.locator('#prohibicion').click();
    await page.locator('#c18old').click();
    await page.locator('#step3toSubmit').click();
    await page.waitForTimeout(200);
    
    
    console.log("OK") 
    return(status.ok)

  } catch (error) {
    return(status.error(error))
  }
}

module.exports = loginBplay;