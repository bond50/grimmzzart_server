const express = require('express');
const router = express.Router();


const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {create, list, read, update, remove} = require('../controllers/brand');
const {authorize} = require("../middlewares/authorize");
// Create brand
router.post('/brand', requireSignin, authCheck, adminCheck, authorize('create', 'Brand'), create);

// List brands
router.get('/brands', list);

// Read single brand
router.get('/brand/:slug', read);

// Update brand
router.put('/brand/:slug', requireSignin, authCheck, adminCheck, authorize('update', 'Brand'), update);

// Delete brand
router.delete('/brand/:slug', requireSignin, authCheck, adminCheck, authorize('delete', 'Brand'), remove);

module.exports = router;
