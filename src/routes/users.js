const express = require('express')
const routes = express.Router()

const userController = require('../app/controllers/userController')
const sessionController = require('../app/controllers/sessionController')

const sessionValidator = require('../app/validators/session')

/* -- User Register -- */
routes.get('/list', userController.list)
routes.get('/register', userController.register)
routes.post('/register', sessionValidator.newRegisterUser, userController.post)
routes.get('/edit', userController.editFirstTIme)
routes.get('/edit/:id', userController.edit)
routes.put('/edit', sessionValidator.updateUser, userController.update)
routes.delete('/list', userController.delete)

/* --- SESSION --- */

/* -- Login / Logout -- */
routes.get('/login', sessionController.loginForm)
routes.post('/login', sessionValidator.loginUser, sessionController.postLogin)
routes.post('/logout', sessionController.logout)

/* -- Reset Password / Forgot -- */
routes.get('/forgot-password', sessionController.forgotForm)
routes.get('/password-reset', sessionController.resetForm)
routes.post('/forgot-password', sessionController.forgot)
routes.post('/password-reset', sessionValidator.forgot, sessionController.reset)

module.exports = routes