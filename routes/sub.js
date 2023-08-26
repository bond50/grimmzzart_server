const express = require('express')
const {create, list, update, read, remove, listOnlySubsWithProducts} = require('../controllers/sub')
const router = express.Router()

const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");
router.post('/sub', requireSignin, authCheck, adminCheck, authorize('create', 'Sub'), create)
router.get('/subs', list);
router.get('/subs-with-products', listOnlySubsWithProducts);
router.get('/sub/:slug', read);
router.put('/sub/:slug', requireSignin, authCheck, adminCheck, authorize('create', 'Sub'), update);
router.delete('/sub/:slug', requireSignin, authCheck, adminCheck, authorize('create', 'Sub'), remove);

module.exports = router
