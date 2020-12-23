const express = require('express');
const authController = require('../controllers/auth');
const AuthValidator = require('../validation/authValidator');

const router = express.Router();
router.get('/login/', authController.getLogin);
router.post('/login/', AuthValidator.checkLogin(), authController.postLogin);
router.get('/signup/', authController.getsignup);
router.post('/signup/', AuthValidator.checkSignup(), authController.postsignup);
router.get('/logout/', authController.getlogout);

module.exports = router;