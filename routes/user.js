const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verify, verifyAdmin, isLoggedIn } = require("../auth");


// User registration
router.post('/register', userController.registerUser);

// User authentication
router.post('/login', userController.loginUser);

// Retrieve user details
router.get('/details', verify, userController.getUserDetails);


module.exports = router;