const express = require('express')
const routes = express.Router()
const recipes = require('./app/controllers/recipes')

routes.get('/', function(req, res){
    return res.render("index")
})

routes.get('/about', function(req, res){
    return res.render("about")
})

routes.get('/revenue', recipes.index)
routes.get('/show/:id', recipes.showRecipe)


/* ===== ROUTES MANAGEMENT ===== */

routes.get('/admin/manager', function(req, res){
    return res.render("admin/manager")
})

routes.get('/admin/create', recipes.create)
routes.post('/admin/manager', recipes.post)
routes.get('/admin/show/:id', recipes.show)
routes.get('/admin/:id/edit/', recipes.edit)
routes.put('/admin/edit', recipes.put)
routes.get('/admin/list', recipes.list)


module.exports = routes