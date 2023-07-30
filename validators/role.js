const {check} = require("express-validator");
exports.roleCreateValidationRules = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({min: 2, max: 50})
        .withMessage('Name must be between 2 and 50 characters'),
    check('code')
        .notEmpty()
        .withMessage('Code is required')
        .isInt()
        .withMessage('Code must be an integer'),
    check('permissions')
        .isArray()
        .withMessage('Permissions must be an array')
        .notEmpty()
        .withMessage('Permissions are required'),
];


exports.roleUpdateValidationRules = [
    check("name")
        .custom((value, {req}) => {
            console.log(req.body)
            if (req.body.hasOwnProperty("name")) {
                if (value.length >= 3 && value.length <= 30) {
                    return true;
                } else {
                    throw new Error("Name must be between 3 and 30 characters");
                }
            }
            return true;
        }),
    check("code")
        .custom((value, {req}) => {
            if (req.body.hasOwnProperty("code")) {
                if (Number.isInteger(value)) {
                    return true;
                } else {
                    throw new Error("Code must be an integer");
                }
            }
            return true;
        }),
    check("permissions")
        .custom((value, {req}) => {
            if (req.body.hasOwnProperty("permissions")) {
                if (Array.isArray(value) && value.length >= 0) {
                    return true;
                } else {
                    throw new Error("Permissions must be a non-empty array");
                }
            }
            return true;
        }),
];

