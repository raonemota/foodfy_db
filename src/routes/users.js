const express = require('express')
const routes = express.Router()

const userController = require('../app/controllers/userController')

const sessionValidator = require('../app/validators/session')

/* -- Login / Logout -- */
routes.get('/login', userController.loginForm)
routes.post('/login', sessionValidator.loginUser, userController.postLogin)
routes.post('/logout', userController.logout)

/* -- Reset Password / Forgot -- */
routes.get('/forgot-password', userController.forgotForm)
routes.get('/password-reset', userController.resetForm)
routes.post('/forgot-password', userController.forgot)
routes.post('/password-reset', sessionValidator.forgot, userController.reset)

/* -- User Register -- */
routes.get('/list', userController.list)

routes.get('/register', userController.registerForm)
routes.post('/register', sessionValidator.newRegisterUser, userController.post)
routes.get('/edit', userController.editForm)
routes.get('/edit/:id', userController.editUser)
routes.put('/edit', sessionValidator.updateUser, userController.updateFormNewUser)
routes.delete('/list', userController.deleteUser)



module.exports = routes