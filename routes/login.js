const { Router } = require('express');

const login = Router();

const loginController = require('../controllers/loginController')
const isAuthenticated = require('../authentication/auth')

//base url login/

login.post('/', loginController.signIn)

login.post('/check', isAuthenticated)

module.exports = login