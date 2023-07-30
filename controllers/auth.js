const User = require('../models/user')
const shortId = require('shortid')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const {errorHandler} = require("../helpers/dbErrorHandler");
const {OAuth2Client} = require('google-auth-library')
const sgMail = require("@sendgrid/mail");
const Role = require('../models/role')

const {CustomError} = require("../middlewares/errorHandler");

//testing Last
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.currentUser = async (req, res) => {
    const email = req.body
    User.findOne({email}).exec((err, user) => {
        if (err) {
            throw new Error(err)
        }
        res.json(user)
    })
}
exports.proceed = async (req, res) => {
    res.json({ok: true})
}

exports.preSignup = async (req, res, next) => {
    try {
        const {email, phoneNumber, idNo, drivingLicense, username} = req.body;
        // Check if phone number is taken
        let formattedPhoneNumber = phoneNumber;
        if (phoneNumber.startsWith("+254")) {
            formattedPhoneNumber = phoneNumber.replace("+254", "0");
        }
        const userWithPhoneNumber = await User.findOne({phoneNumber: formattedPhoneNumber});
        if (userWithPhoneNumber) {
            return next(new CustomError(400, "Phone number is taken"));
        }

        // Check if email is taken
        const userWithEmail = await User.findOne({email: email.toLowerCase()});
        if (userWithEmail) {
            return next(new CustomError(400, "Email is taken"));
        }


        // Check if ID number is taken
        if (idNo) {
            const userWithIDNumber = await User.findOne({idNo});
            if (userWithIDNumber) {
                return next(new CustomError(400, "ID number is taken"));
            }
        }

        // Check if driving license is taken
        if (drivingLicense) {
            const userWithDrivingLicense = await User.findOne({drivingLicense});
            if (userWithDrivingLicense) {
                return next(new CustomError(400, "Driving license is taken"));
            }
        }

        // Check if username is taken
        const userWithUsername = await User.findOne({username});
        if (userWithUsername) {
            return next(new CustomError(400, "Username is taken"));
        }
        const token = jwt.sign(req.body, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: "10m",
        });
        const emailData = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Account activation link`,
            html: `
            <p>Please use the following link to activate your account. The link expires after 10 minutes</p>
            <p>${process.env.CLIENT_URL}/auth/complete/${token}</p>
            <br>
            <p>This email may contain sensitive information</p>
            <p>https://myfarm.com</p>`,
        };
        await sgMail.send(emailData);
        res.json({
            message: `Check ${email} within 10 minutes`,
        });
    } catch (error) {
        next(error);
    }
};


// The signup controller
exports.signup = async (req, res, next) => {
    try {
        const token = req.body.token;

        if (!token) {
            return next(new CustomError(400, "Token is required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

        const {
            firstName,
            middleName,
            phoneNumber,
            idNo,
            drivingLicense,
            surname,
            gender,
            terms,
            email,
            password,
            role: providedRole,
        } = decoded;

        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;

        let userRole = null;

        if (providedRole) {
            userRole = await Role.findOne({name: providedRole});
            if (!userRole) {
                return next(new CustomError(400, `Provided role ${providedRole} not found`));
            }
        } else {
            userRole = await Role.findOne({name: "subscriber"});
            if (!userRole) {
                return next(new CustomError(500, 'Default "subscriber" role not found'));
            }
        }

        const newUser = new User({
            firstName,
            middleName,
            surname,
            phoneNumber,
            gender,
            terms,
            email,
            profile,
            username,
            role: userRole._id,
        });


        newUser._password = password;
        await newUser.save((err) => {
            if (err) {
                return next(new CustomError(400, err.message));
            }
            return res.json({message: "Signup success! Please signin."});
        });
    } catch (error) {
        next(error);
    }
};


exports.signin = async (req, res, next) => {
    const {identifier, password} = req.body;

    try {
        if (!identifier) {
            next(new CustomError(400, 'An identifier (email, phone number, or username) is required.'));
        }
        // Check if the user exists and populate the role and permissions fields
        const user = await User.findOne({
            $or: [{email: identifier}, {phoneNumber: identifier}, {username: identifier}],
        })
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                },
            })
            .exec();

        if (!user) {
            next(new CustomError(400, `User not found. Please signup.`));
        } else if (user.blocked) {
            next(new CustomError(403, 'Your account has been blocked permanently. Please contact the administrator.'));
        } else if (user.suspended) {
            next(new CustomError(403, `Your account is suspended until ${user.suspensionEnd}. Please contact the administrator.`));
        } else {
            // Authenticate
            const isPasswordMatch = await user.authenticate(password);
            if (!isPasswordMatch) {
                next(new CustomError(400, `${identifier} and password do not match.`));
            } else {
                // Generate a token and send to the client
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
                res.cookie('token', token, {expiresIn: '1d'});

                // Destructure the user object and remove unnecessary properties
                const {
                    _id,
                    username,
                    address,
                    cart,
                    firstName,
                    middleName,
                    surname,
                    role,
                } = user.toObject();

                console.log(role)
                res.json({
                    user: {
                        _id,
                        token,
                        address,
                        cart,
                        username,
                        firstName,
                        middleName,
                        surname,
                        role,
                    },
                });
            }
        }
    } catch (err) {
        next(err);
    }
};


exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Signout success'
    });
};


exports.forgotPassword = (req, res) => {

    const {email} = req.body;
    User.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'});

        // email
        const emailData = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Password reset link`,
            html: `
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>myfarm.com</p>
        `
        };
        // populating the db > user > resetPasswordLink
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if (err) {
                return res.json({error: errorHandler(err)});
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: ` Sent to ${email}. Link expires in 10min.`
                    });
                });
            }
        });
    });
};


exports.resetPassword = (req, res) => {
    const {resetPasswordLink, password} = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again'
                });
            }
            User.findOne({resetPasswordLink}, async (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try later'
                    });
                }

                if (!password) {
                    return res.status(400).json({
                        error: 'Password is required'
                    });
                }

                user._password = password; // Set the plain text password
                user.resetPasswordLink = '';

                try {
                    await user.save();
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                } catch (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
            });
        });
    }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.googleLogin = (req, res) => {

    console.log(client)
    const idToken = req.body.tokenId

    client.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
        const {email_verified, name, email, jti} = response.payload
        if (email_verified) {
            User.findOne({email}).exec((err, user) => {
                if (user) {
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

                    res.cookie('token', token, {expiresIn: '1d'});
                    const {_id, username, name, email, role} = user;
                    return res.json({
                        token,
                        user: {_id, username, name, email, role}
                    });
                } else {

                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti;

                    const newUser = new User({username, email, profile});
                    newUser._password = password; // Set the plain text password using the virtual setter

                    newUser.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
                        res.cookie('token', token, {expiresIn: '1d'});
                        const {_id, username, name, email, role} = data;
                        return res.json({
                            token,
                            user: {_id, username, name, email, role}
                        });
                    });

                }
            })
        } else {

            return res.status(400).json({
                error: "Google login failed...Try again"
            });
        }

    });

}
