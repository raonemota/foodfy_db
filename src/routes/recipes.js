const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const recipesController = require('../app/controllers/recipesController')

const { redirectToLogin, verifyIfUserCreator } = require('../app/middlewares/session')

/* -- Admin Home -- */
routes.get('/manager', function(req, res){
    return res.render("admin/manager")
})
routes.get('/list', recipesController.list)
routes.get('/create', recipesController.create)
routes.get('/show/:id', recipesController.show)
routes.get('/:id/edit/', verifyIfUserCreator, recipesController.edit)
routes.post('/create', multer.array("photos", 6), recipesController.post)
routes.put('/edit', multer.array("photos", 6), recipesController.put)
routes.delete('/edit',redirectToLogin,  recipesController.delete)

module.exports = routes