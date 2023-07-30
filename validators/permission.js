// validators/permissionValidator.js
const { check } = require("express-validator");

exports.permissionValidationRules = [
    check('name').notEmpty().withMessage('Permission name is required'),
    check('resource').notEmpty().withMessage('Resource is required'),
    check('action').notEmpty().withMessage('Action is required')
];

exports.assignRoleValidationRules = [
    check('userId').notEmpty().withMessage('User ID is required'),
    check('roleId').notEmpty().withMessage('Role ID is required')
];
