const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth');
const express = require('express');
const {
    listPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    assignRoleToUser,
    removeRoleFromUser, listPermissionsWithPagination
} = require('../controllers/permission');

const {authorize} = require("../middlewares/authorize");
const {permissionValidationRules, assignRoleValidationRules} = require("../validators/permission");
const {runValidation} = require("../validators");
const router = express.Router();
router.get('/permissions', requireSignin, authCheck, adminCheck, authorize('read', 'Permission'), listPermissions);
router.get('/permissions-pagination', requireSignin, authCheck, adminCheck, authorize('read', 'Permission'), listPermissionsWithPagination);
router.post('/permissions', requireSignin, authCheck, adminCheck, authorize('create', 'Permission'), permissionValidationRules, runValidation, createPermission);
router.put('/permissions/:id', requireSignin, authCheck, adminCheck, authorize('update', 'Permission'), permissionValidationRules, runValidation, updatePermission);
router.delete('/permissions/:id', requireSignin, authCheck, adminCheck, authorize('delete', 'Permission'), deletePermission);
router.post('/assign-role', requireSignin, authCheck, adminCheck, authorize('update', 'Permission'), assignRoleValidationRules, runValidation, assignRoleToUser);
router.post('/remove-role', requireSignin, authCheck, adminCheck, authorize('delete', 'Permission'), assignRoleValidationRules, runValidation, removeRoleFromUser);

module.exports = router;
