const express = require('express')
const routes = express.Router()

const homeController = require('../app/controllers/homeController')

const { redirectToLogin } = require('../app/middlewares/session')

const admin = require('./admin')
const chefs = require('./chefs')
const users = require('./users')

routes.use('/admin', admin)
routes.use('/chefs', chefs)
routes.use('/users', users)

/* -- Home -- */
routes.get('/', homeController.index)
routes.get('/about', homeController.about)
routes.get('/revenue', homeController.recipesList)
routes.get('/show/:id', homeController.showRecipe)
routes.get('/chefs', homeController.listChefsHome)

module.exports = routes