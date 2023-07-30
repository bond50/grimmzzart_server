const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')

const express = require('express')
const {authorize} = require("../middlewares/authorize");
const {runValidation} = require("../validators");
const {listRoutes, createRoute, updateRoute, deleteRoute} = require("../controllers/routeController");
const {routeValidationRules} = require("../validators/routeValidator");
const router = express.Router()

router.get('/routes', requireSignin, authCheck, adminCheck, authorize('read', 'Route'), listRoutes);
router.post('/routes', requireSignin, authCheck, adminCheck, authorize('create', 'Route'), routeValidationRules, runValidation, createRoute);
router.put('/routes/:id', requireSignin, authCheck, adminCheck, authorize('update', 'Route'), routeValidationRules, runValidation, updateRoute);
router.delete('/routes/:id', requireSignin, authCheck, adminCheck, authorize('delete', 'Route'), deleteRoute);


module.exports = router;


