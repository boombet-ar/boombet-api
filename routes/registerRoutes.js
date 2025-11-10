const {Router} = require('express')
const router = Router()
const registerControllers = require('../controllers/registerControllers')



router.post('/afiliar/:provincia/:nombreCasino',registerControllers.registerCasino) //Revisar. la finalidad de este endpoint simplemente será afiliar a todos los jugadores de la db a un casino.




router.post('/:provincia', registerControllers.registerProvincia)   //Afiliar en todo el conjunto de casinos de una provincia

router.post('/:provincia/:tokenAfiliador', registerControllers.registerProvincia)   //Afiliar con token de afiliador

module.exports = router

