const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile/:id', authController.getProfile);
router.put('/profile/:id', authController.updateProfile);

module.exports = router;
