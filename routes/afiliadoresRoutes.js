const {Router} = require('express')
const router = Router()
const afiliadoresControllers = require('../controllers/afiliadoresControllers')

router.get('/', afiliadoresControllers.getAfiliadores)

router.post('/toggleActivo/:id', afiliadoresControllers.toggleAfiliadorActivo)

router.post('/af_admin_login', afiliadoresControllers.afAdminLogin)

router.delete('/delete/:id',afiliadoresControllers.deleteAfiliador)
module.exports = router
