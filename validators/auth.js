const {check} = require('express-validator');

exports.userSignupValidator = [
    check('firstName', 'First name is required')
        .notEmpty(),
    check('surname', 'Surname is required')
        .notEmpty(),
    check('phoneNumber', 'Your phone number is required')
        .notEmpty(),

    check('email', 'Email address is required')
        .notEmpty()
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('dob', 'Select you date of birth')
        .notEmpty()
        .isDate()
        .withMessage('Must be a valid date'),
    check("password", "Password is required")
        .notEmpty()
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters long')
        .isLength({
            max: 120
        })
        .withMessage("Password can contain max 120 characters")
    ,
    check('confirmPassword', 'Confirmation password cannot be empty')
        .notEmpty()
        .custom((value, {req}) => {

            if (value !== req.body.password) {
                throw new Error('Passwords must be same')
            }
            return true;
        })
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 6 characters long')
];


exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address'),
];

exports.resetPasswordValidator = [
    check('password')
        .not()
        .isEmpty()
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters long'),

    check('password1', 'Confirmation password cannot be empty')
        .notEmpty()
        .custom((value, {req}) => {

            if (value !== req.body.password) {
                throw new Error('Passwords must be same')
            }
            return true;
        })


];