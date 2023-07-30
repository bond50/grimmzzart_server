const express = require('express');
const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth');
const router = express.Router();
const {authorize} = require("../middlewares/authorize");
const {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getAllUsers,


} = require("../controllers/userManagement");
const {runValidation} = require("../validators");
const {userCreateValidator} = require("../validators/userManagement");
router.get('/user-management/users', requireSignin, authCheck, adminCheck, authorize('read', 'User'), getAllUsers);
router.get('/user-management/:userId', requireSignin, authCheck, adminCheck, authorize('read', 'User'), getUser);
router.post('/user-management/create-user', requireSignin, authCheck, authorize('create', 'User'), userCreateValidator, runValidation, createUser);
router.put('/user-management/:userId', requireSignin, authCheck, adminCheck, authorize('update', 'User'), updateUser);
router.delete('/user-management/:userId', requireSignin, authCheck, adminCheck, authorize('delete', 'User'), deleteUser);


module.exports = router;
