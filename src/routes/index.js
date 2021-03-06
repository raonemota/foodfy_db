const express = require('express')
const routes = express.Router()

const homeController = require('../app/controllers/homeController')

const recipes = require('./recipes')
const chefs = require('./chefs')
const users = require('./users')

routes.use('/recipes', recipes)
routes.use('/chefs', chefs)
routes.use('/users', users)

/* -- Home -- */
routes.get('/', homeController.index)
routes.get('/about', homeController.about)
routes.get('/revenue', homeController.recipesList)
routes.get('/show/:id', homeController.showRecipe)
routes.get('/chefs', homeController.listChefsHome)

module.exports = routes