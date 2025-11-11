const {Router} = require('express')
const router = Router()
const registerRoutes = require('./registerRoutes')
const afiliadoresRoutes = require('./afiliadoresRoutes')
const headerAuth = require('../middleware/auth')

router.use('/register', headerAuth, registerRoutes) 

router.use('/afiliadores', afiliadoresRoutes)

module.exports = router