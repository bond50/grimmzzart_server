const express = require('express')
const {upload, remove} = require('../controllers/cloudinary')
const router = express.Router()

// //validators
// const {runValidation} = require('../validators')
// const {categoryCreateValidator} = require('../validators/category')
const {requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");


router.post('/upload-images', requireSignin, authCheck,authorize('create','Product'), upload)
router.post('/remove-image', requireSignin, authCheck,authorize('delete','Product'), remove);


module.exports = router
