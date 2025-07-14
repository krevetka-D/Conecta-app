const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser, // Import the new logoutUser function
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // Add the new logout route

module.exports = router;