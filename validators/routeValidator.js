const { check } = require('express-validator');

exports.routeValidationRules = [
  check('path')
    .notEmpty()
    .withMessage('Path is required')
    .isString()
    .withMessage('Path must be a string'),
  check('permissions')
    .isArray()
    .withMessage('Permissions must be an array of permission objects'),
];
