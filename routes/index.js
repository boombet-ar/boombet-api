const {Router} = require('express')
const router = Router()
const registerRoutes = require('./registerRoutes')
const headerAuth = require('../middleware/auth')

router.use('/register', headerAuth, registerRoutes) 

module.exports = router