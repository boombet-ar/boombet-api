const {Router} = require('express')
const router = Router()
const registerControllers = require('../controllers/registerControllers')
const headerAuth = require('../middleware/auth')


router.post('/:provincia/:nombreCasino',headerAuth, registerControllers.registerCasino)


router.post('/:provincia', headerAuth ,registerControllers.registerProvincia)  //<-- registerPba ejecuta TODOS los scripts de casinos de santa fe

module.exports = router