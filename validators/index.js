const {validationResult} = require("express-validator");
const {CustomError} = require("../middlewares/errorHandler");

exports.runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        // Send the first error message instead of the whole array
        next(new CustomError(422, errorMessages[0]));

    } else {
        next();
    }
};
