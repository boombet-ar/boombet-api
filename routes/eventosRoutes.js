const {Router} = require('express')
const router = Router()
const eventosControllers = require('../controllers/eventosControllers')

router.get('/', eventosControllers.getEventos)

router.post('/', eventosControllers.crearEvento)

router.post('/afiliador/:id_afiliador', eventosControllers.asignarAfiliador)

module.exports = router
