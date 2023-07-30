const {check} = require('express-validator');

exports.userCreateValidator = [
    check('phoneNumber')
        .not()
        .isEmpty()
        .withMessage('Phone Number is required'),
    check('firstName')
        .not()
        .isEmpty()
        .withMessage('FirstName is required'),
    check('surname')
        .not()
        .isEmpty()
        .withMessage('Surname is required'),
    check('role')
        .not()
        .isEmpty()
        .withMessage('Role is required'),
    check('dob')
        .not()
        .isEmpty()
        .withMessage('Date of birth is required'),
    check('gender')
        .not()
        .isEmpty()
        .withMessage('Gender is required'),
    check('password')
        .not()
        .isEmpty()
        .withMessage('Password is required'),

    check('confirmPassword')
        .not()
        .isEmpty()
        .withMessage('Please confirm user password'),
    check('confirmPassword')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
        .withMessage('Please confirm user password'),

    check('email')
        .not()
        .isEmpty()
        .withMessage('Email required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),

];