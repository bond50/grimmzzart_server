const express = require('express')
const {
    signup,
    signout,
    signin,
    preSignup,
    forgotPassword,
    resetPassword,
    updatePassword,
    googleLogin,
    verify2FA,
    signinWithAuthenticator,
    getUserVerificationInfo,
    proceed
} = require('../controllers/auth')

const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')


const router = express.Router()

//validators
const {runValidation} = require('../validators')
const {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth')
const {authorize} = require("../middlewares/authorize");



router.post('/pre-signup', userSignupValidator, runValidation, preSignup)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signin-mfa', signinWithAuthenticator)
router.post('/verify2FA', verify2FA)
router.get('/user-verification/:userId', getUserVerificationInfo);
router.post('/current-admin', requireSignin, authCheck, adminCheck, proceed)
router.post('/current-user', requireSignin, authCheck, proceed)


router.get('/signout', signout)
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)
router.put('/change-password/:userId', resetPasswordValidator, runValidation, updatePassword);
router.post('/google-login', googleLogin)

module.exports = router
