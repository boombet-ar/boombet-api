const {Router} = require('express')
const router = Router()
const registerControllers = require('../controllers/registerControllers')
const headerAuth = require('../middleware/auth')


router.post('/pba', headerAuth ,registerControllers.registerPBA)  //<-- registerPba ejecuta TODOS los scripts de casinos de pba 

module.exports = router