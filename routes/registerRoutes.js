const {Router} = require('express')
const router = Router()
const registerControllers = require('../controllers/registerControllers')
const headerAuth = require('../middleware/auth')


router.post('/:provincia/:nombreCasino',headerAuth, registerControllers.registerCasino)

router.post('/pba', headerAuth ,registerControllers.registerPBA)  //<-- registerPba ejecuta TODOS los scripts de casinos de pba 

router.post('/caba', headerAuth ,registerControllers.registerCABA)  //<-- registerPba ejecuta TODOS los scripts de casinos de pba 

router.post('/cba', headerAuth ,registerControllers.registerCBA)  //<-- registerPba ejecuta TODOS los scripts de casinos de cordoba

router.post('/sfe', headerAuth ,registerControllers.registerSFE)  //<-- registerPba ejecuta TODOS los scripts de casinos de santa fe


module.exports = router