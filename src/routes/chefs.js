const express = require('express')
const routes = express.Router()

const chefsController = require('../app/controllers/chefsController')

const { redirectToLogin } = require('../app/middlewares/session')
const { updateChefs } = require('../app/validators/session')

/* -- Chefs -- */
routes.get('/list', chefsController.list)
routes.get('/create', redirectToLogin, chefsController.create)
routes.post('/create', chefsController.post)
routes.get('/show/:id', chefsController.show)
routes.get('/:id/edit/', redirectToLogin, chefsController.edit)
routes.put('/edit', updateChefs, chefsController.put)
routes.delete('/edit', chefsController.delete)


module.exports = routes