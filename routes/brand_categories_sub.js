const express = require('express')
const {getSortedEntities} = require('../controllers/brand_category_sub')
const router = express.Router()


router.get('/brands-categories-subs', getSortedEntities);


module.exports = router
