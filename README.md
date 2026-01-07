🎰 Boombet Automation API

API centralizada para la automatización de afiliaciones en casinos, gestión de eventos y administración de afiliados. Utiliza Playwright para la ejecución de scripts de navegación y PostgreSQL para la persistencia de datos.

🚀 Stack Tecnológico

Runtime: Node.js

Framework: Express.js

Automation: Playwright (Chromium)

Database: PostgreSQL

Infrastructure: Docker & Azure Container Apps

CI/CD: GitHub Actions

🛠️ Instalación y Configuración Local

Prerrequisitos

Node.js v18 o superior.

PostgreSQL corriendo localmente o accesible remotamente.

Pasos

Clonar el repositorio:

git clone [https://github.com/boombet-ar/boombet-api.git](https://github.com/boombet-ar/boombet-api.git)
cd boombet-api


Instalar dependencias:

npm install


Nota: Esto instalará también los binarios de los navegadores de Playwright.

Configurar Variables de Entorno:
Crea un archivo .env en la raíz del proyecto (ver sección Variables de Entorno más abajo).

Iniciar la aplicación:

# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start


🔑 Variables de Entorno (.env)

Pueden configurarse mediante un archivo .env en la raíz.

Base de Datos

DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boombet_db

Seguridad

# Key maestra para proteger los endpoints de registro
REGISTER_KEY=tu_api_key_secreta

# Credenciales para el panel de administración de afiliados
AF_ADMIN_USER=admin
AF_ADMIN_PASS=password_segura

Playwright & Proxies

PLAYWRIGHT_HEADLESS=true  # 'false' para ver el navegador abrirse
CAPTCHA_API_KEY=tu_key_de_2captcha

# Configuración de Proxy (IPRoyal u otro)
PROXY_IPROYAL_SERVER=geo.iproyal.com:12321
PROXY_IPROYAL_USERNAME=usuario_proxy
PROXY_IPROYAL_PASSWORD=pass_proxy


Integraciones Externas (Webhooks & URLs)

WEBHOOK_URL=[https://tu-n8n-o-servicio.com/webhook/general](https://tu-n8n-o-servicio.com/webhook/general)
AF_WEBHOOK=[https://tu-n8n-o-servicio.com/webhook/afiliados](https://tu-n8n-o-servicio.com/webhook/afiliados)

# URLs Base de Casinos (Target)
BPLAY_CBA_URL=https://...
BPLAY_CABA_URL=https://...
BPLAY_PBA_URL=https://...
SPORTSBET_PBA_URL=https://...
BPLAY_SFE_URL=https://...


📡 Endpoints de la API

🛡️ Autenticación

Los endpoints de registro requieren el siguiente header por seguridad:

register_key: <Valor definido en tu .env>

📝 Automatización y Registro (/register)

1. Registro Masivo (Por Provincia)
Ejecuta todos los scripts asociados a una provincia.

POST /register/:provincia

Params: provincia (ej: pba, caba, sfe, cba).

2. Registro con Token de Afiliador
Registra un usuario y lo asocia a un afiliador específico.

POST /register/:provincia/:tokenAfiliador

3. Ejecución Unitaria (Script Específico)
Ejecuta la automatización para un solo casino.

POST /register/afiliar/:provincia/:nombreCasino

Params: nombreCasino (ej: sportsbetPba, bplayPba, bplayCaba, etc).

Cuerpo del Request (JSON):

{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan.perez@email.com",
  "telefono": "1112345678",
  "genero": "Masculino",
  "fecha_nacimiento": "01-01-1990",
  "dni": "35123456",
  "cuit": "20-35123456-9",
  "est_civil": "SOLTERO",
  "calle": "Av. Corrientes",
  "numCalle": "1234",
  "provincia": "BUENOS AIRES",
  "ciudad": "CABA",
  "cp": 1043,
  "user": "JuanP2025",
  "password": "Password123!"
}


👥 Gestión de Afiliadores (/afiliadores)

GET /afiliadores

Obtiene la lista de todos los afiliadores.

POST /afiliadores/toggleActivo/:id

Activa o desactiva un afiliador.

DELETE /afiliadores/delete/:id

Elimina un afiliador (Soft delete o hard delete según implementación).

POST /afiliadores/af_admin_login

Login para panel de administración.

Body: { "user": "...", "password": "..." }

📅 Gestión de Eventos (/eventos)

GET /eventos

Lista todos los eventos disponibles.

POST /eventos

Crea un nuevo evento.

Body: { "nombre": "Evento Marzo", "fecha_inicio": "...", "fecha_fin": "...", "provincia_id": 1 }

POST /eventos/afiliador/:id_afiliador

Asigna un afiliador a un evento específico.

Body: { "id_evento": 5 }

🐳 Despliegue (Docker & Azure)

El proyecto está dockerizado para facilitar su despliegue en la nube.

Construir imagen localmente:

docker build -t boombet-api .


Ejecutar contenedor:

docker run -p 3000:3000 --env-file .env boombet-api


CI/CD

El repositorio cuenta con un workflow de GitHub Actions (deploy-azurecontainer.yml) que:

Detecta cambios en la rama main.

Construye la imagen Docker.

La sube a Azure Container Registry (ACR).

Despliega la nueva versión en Azure Container Apps.