const {validationResult} = require("express-validator");
const {CustomError} = require("../middlewares/errorHandler");

exports.runValidation = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array()); // Log the errors to see the exact issue
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        next(new CustomError(422, errorMessages[0]));
    } else {
        next();
    }
};
