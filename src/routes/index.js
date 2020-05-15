const express = require('express')
const routes = express.Router()

const homeController = require('../app/controllers/homeController')

const admin = require('./admin')
const chefs = require('./chefs')

routes.use('/admin', admin)
routes.use('/chefs', chefs)

/* -- Home -- */
routes.get('/', homeController.index)
routes.get('/about', homeController.about)
routes.get('/revenue', homeController.recipesList)
routes.get('/show/:id', homeController.showRecipe)
routes.get('/chefs', homeController.listChefsHome)

module.exports = routes