const {Router} = require('express')
const router = Router()
const registerRoutes = require('./registerRoutes')


router.use('/register', registerRoutes) //Agregar validacion mediante header

module.exports = router