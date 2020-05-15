const express = require('express')
const routes = express.Router()

const chefsController = require('../app/controllers/chefsController')

/* -- Chefs -- */
routes.get('/list', chefsController.list)
routes.get('/create', chefsController.create)
routes.post('/create', chefsController.post)
routes.get('/show/:id', chefsController.show)
routes.get('/:id/edit/', chefsController.edit)
routes.put('/edit', chefsController.put)
routes.delete('/edit', chefsController.delete)


module.exports = routes