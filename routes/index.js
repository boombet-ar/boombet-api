const {Router} = require('express')
const router = Router()
const registerRoutes = require('./registerRoutes')
const afiliadoresRoutes = require('./afiliadoresRoutes')
const eventosRoutes = require('./eventosRoutes')
const headerAuth = require('../middleware/auth')



router.use('/register', headerAuth, registerRoutes)  //register se refiere a afiliaciones

router.use('/afiliadores', afiliadoresRoutes)

router.use('/eventos', eventosRoutes)


module.exports = router