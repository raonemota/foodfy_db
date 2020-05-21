const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const adminController = require('../app/controllers/adminController')

const { redirectToLogin } = require('../app/middlewares/session')

/* -- Admin Home -- */
routes.get('/manager', function(req, res){
    return res.render("admin/manager")
})
routes.get('/list', adminController.list)
routes.get('/create', redirectToLogin, adminController.create)
routes.get('/show/:id', redirectToLogin, adminController.show)
routes.get('/:id/edit/', redirectToLogin, adminController.edit)
routes.post('/create', multer.array("photos", 6), adminController.post)
routes.put('/edit', multer.array("photos", 6), adminController.put)
routes.delete('/edit',redirectToLogin,  adminController.delete)

module.exports = routes