const express = require('express');
const {create, list, update, read, remove} = require('../controllers/banner');
const router = express.Router();

const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth');
const {authorize} = require("../middlewares/authorize");

router.post('/banner', requireSignin, authCheck, adminCheck, authorize('create', 'Banner'), create);
router.get('/banners', list);
router.get('/banner/:slug', read);
router.put('/banner/:slug', requireSignin, authCheck, adminCheck, authorize('update', 'Banner'), update);
router.delete('/banner/:slug', requireSignin, authCheck, adminCheck, authorize('delete', 'Banner'), remove);

module.exports = router;
