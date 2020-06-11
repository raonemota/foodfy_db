const fs = require('fs')
const Chefs = require('../models/Chefs')
const Recipe = require('../models/Recipes')
const User = require('../models/Users')

const { date } = require('../../lib/utils')

module.exports = {

    async list(req, res){
        
        const chefs = await Chefs.all()
        
        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''
        
        return res.render("admin/chefs/list", { chefs, user, success } )
    },
    async create(req, res){

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        return res.render('admin/chefs/create', { user })
    },
    async post(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.redirect(`/chefs/${req.body.id}/edit?msgError=1`)
            }
        }

        result = await Chefs.create({
            name,
            avatar_url,
            created_at: date(Date.now()).format
        })

        return res.redirect("/chefs/list?msgSuccess=1")
    }, 
    async show(req, res){
   
        const chef = await Chefs.findOne({where: { id: req.params.id }})     
        
        const recipesPerChef = await Recipe.findAll({where: { id_chef: req.params.id }})

        async function getImage(recipeId){
            let files = await Recipe.files(recipeId)
            files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            return files[0]
        }

        const recipesPromise = recipesPerChef.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const recipes = await Promise.all(recipesPromise)                

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''

        return res.render("admin/chefs/show", { chef, recipes, totalRecipes: recipesPerChef.length, user, success } )

    },
    async edit(req, res){

        const chef = await Chefs.findOne({where: { id: req.params.id }})

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        error = (req.query.msgError) ? 'Todos os campos devem ser preenchidos.' : ''

        return res.render('admin/chefs/edit', { chef, user, error })
        
    },
    async put(req, res){

        results = await Chefs.update(req.body.id, {
            name: req.body.name,
            avatar_url: req.body.avatar_url
        })

        return res.redirect(`/chefs/show/${req.body.id}?msgSuccess=1`)
    },
    async delete(req, res){

        const recipePerChef = await Recipe.findAll({where: {id_chef: req.body.id}})

        const allFilesPromise =  recipePerChef.map(async recipe => 
            await Recipe.files(recipe.id))        

        let promiseResults = await Promise.all(allFilesPromise)

        // remover as imagens da pasta public
        promiseResults.map(results => {
             results.map(file => fs.unlinkSync(file.path))
        })

        await Chefs.delete(req.body.id)

        return res.redirect(`/chefs/list?msgSuccess=1`)

    }

}