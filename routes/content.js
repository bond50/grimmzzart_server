const express = require('express')
const router = express.Router()
const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");
const {createContent, getContents, getContentByType} = require('../controllers/content');


router.post('/content', requireSignin, authCheck, adminCheck, authorize('create', 'Content'), createContent);
router.get('/contents', getContents);
router.get('/contents/:type', getContentByType);

module.exports=router

