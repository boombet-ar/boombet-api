# Boombet Automation API

Esta API sirve como un punto central para automatizar los procesos de afiliación y registro en diversas plataformas de casinos. Utiliza scripts de **Playwright** (con Chromium) para ejecutar las automatizaciones de forma robusta.

## 🚀 Stack Tecnológico

* **Node.js:** Entorno de ejecución de la API.
* **Playwright:** Biblioteca para la automatización y el *scraping* web.
* **Docker:** Para la contenedorización de la aplicación.
* **GitHub Actions:** Para la Integración Continua y Despliegue Continuo (CI/CD).
* **Azure Container Registry (ACR):** Registro privado de las imágenes Docker.

---

## ⚡ Uso de la API

La API expone un endpoint principal para iniciar el proceso de registro de un nuevo afiliado.

### Endpoint de Registro

Inicia el script de automatización para la provincia (o conjunto de casinos) especificada.

`POST /register/{provincia}`

#### Parámetros de URL

* `{provincia}`: El identificador de la provincia o grupo de scripts a ejecutar (ej: `pba`, `caba`, `full`).

#### Autenticación

El acceso está protegido. Es necesario enviar un *header* de autenticación en la solicitud:

* **Header:** `register_key`
* **Valor:** (La clave secreta configurada en el entorno)

#### Cuerpo de la Solicitud (Body)

La solicitud debe incluir un cuerpo (`body`) en formato JSON con los datos del jugador necesarios para el registro.

```json
{
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan.perez@ejemplo.com",
    "telefono": "1112344321",
    "genero": "Masculino",
    "fecha_nacimiento": "11-11-2003",
    "dni": "45462226",
    "cuit": "20-42532343-6",
    "est_civil": "SOLTERO",
    "calle": "CALLEFALSA",
    "numCalle": "123",
    "provincia": "Buenos Aires",
    "ciudad": "MORENO",
    "cp": 1234,
    "user": "JuanPe2025",
    "password": "PasswordSeguro123."
}
