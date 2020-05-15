const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const adminController = require('../app/controllers/adminController')

/* -- Admin Home -- */
routes.get('/manager', function(req, res){
    return res.render("admin/manager")
})
routes.get('/list', adminController.list)
routes.get('/create', adminController.create)
routes.get('/show/:id', adminController.show)
routes.get('/:id/edit/', adminController.edit)
routes.post('/create', multer.array("photos", 6), adminController.post)
routes.put('/edit', multer.array("photos", 6), adminController.put)
routes.delete('/edit', adminController.delete)

// Rotas de perfil de um usuário logado
//routes.get('/profile', ProfileController.index) // Mostrar o formulário com dados do usuário logado
//routes.put('/profile', ProfileController.put)// Editar o usuário logado

// Rotas que o administrador irá acessar para gerenciar usuários
//routes.get('/users', UserController.list) //Mostrar a lista de usuários cadastrados
//routes.post('/users', UserController.post) //Cadastrar um usuário
//routes.put('/users', UserController.put) // Editar um usuário
// routes.delete('/users', UserController.delete) // Deletar um usuário


module.exports = routes