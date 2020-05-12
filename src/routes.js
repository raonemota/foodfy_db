const express = require('express')
const routes = express.Router()
const multer = require('./app/middlewares/multer')

const recipes = require('./app/controllers/recipes')
const chefs = require('./app/controllers/chefs')


/* -- Home -- */
routes.get('/', recipes.index)
routes.get('/about', recipes.about)
routes.get('/revenue', recipes.recipesList)
routes.get('/show/:id', recipes.showRecipe)

routes.get('/chefs', chefs.listChefsHome)


/* ===== ROUTES MANAGEMENT ===== */

/* -- Recipes -- */
routes.get('/admin/manager', function(req, res){
    return res.render("admin/manager")
})
routes.get('/admin/create', recipes.create)
routes.get('/admin/show/:id', recipes.show)
routes.get('/admin/:id/edit/', recipes.edit)
routes.post('/admin/create', multer.array("photos", 6), recipes.post)
routes.put('/admin/edit', multer.array("photos", 6), recipes.put)
routes.get('/admin/list', recipes.list)
routes.delete('/admin/edit', recipes.delete)


/* -- Chefs -- */
routes.get('/chefs/list', chefs.list)
routes.get('/chefs/create', chefs.create)
routes.post('/chefs/create', chefs.post)
routes.get('/chefs/show/:id', chefs.show)
routes.get('/chefs/:id/edit/', chefs.edit)
routes.put('/chefs/edit', chefs.put)
routes.delete('/chefs/edit', chefs.delete)


module.exports = routes