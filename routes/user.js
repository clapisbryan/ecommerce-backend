const express = require("express");
const userController = require("../controllers/user.js");

// const passport = require('passport');
const { verify, isLoggedIn, verifyAdmin } = require("../auth.js");

const router = express.Router();

// Accessed by all users
router.post('/register', userController.registerUser);
// Accessed by all users
router.post('/login', userController.loginUser);
// Authenticated user only
router.get('/details', verify, userController.showUserDetails);

router.patch('/update-user', verify, userController.updateUser);
// Admin-only
router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.updateAdmin);
// Authenticated user only
router.patch('/update-password', verify, userController.updatePassword);

module.exports = router;