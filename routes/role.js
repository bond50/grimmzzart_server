const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {createRole,resetRolesAndPermissions, listRoles, updateRole, deleteRole} = require("../controllers/role");
const express = require('express')
const {authorize} = require("../middlewares/authorize");
const {roleCreateValidationRules, roleUpdateValidationRules} = require("../validators/role");
const {runValidation} = require("../validators");
const router = express.Router()
router.get('/roles', requireSignin, authCheck,adminCheck, authorize('read', 'Role'), listRoles);
router.get('/reset', requireSignin, authCheck,adminCheck, authorize('update', 'Role'), resetRolesAndPermissions);
router.post('/roles', requireSignin,authCheck, adminCheck, authorize('create', 'Role'), roleCreateValidationRules, runValidation, createRole);
router.put('/roles/:id', requireSignin, authCheck,adminCheck, authorize('update', 'Role'), roleUpdateValidationRules, runValidation, updateRole);
router.delete('/roles/:id', requireSignin, authCheck,adminCheck, authorize('delete', 'Role'), deleteRole);
module.exports = router;


module.exports = router
