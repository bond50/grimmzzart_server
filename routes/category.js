const express = require('express')
const {create, list, update, read, remove, getSubs} = require('../controllers/category')
const router = express.Router()

const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");


router.post('/category', requireSignin, authCheck, adminCheck, authorize('create', 'Category'), create)
router.get('/categories', list);
router.get('/category/:slug', read);
router.put('/category/:slug', requireSignin, authCheck, adminCheck, authorize('update', 'Category'), update);
router.delete('/category/:slug', requireSignin, authCheck, adminCheck, authorize('delete', 'Category'), remove);
router.get('/category/subs/:_id', getSubs);

module.exports = router
