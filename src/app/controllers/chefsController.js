const fs = require('fs')
const Chefs = require('../models/Chefs')
const Recipe = require('../models/Recipes')
const User = require('../models/Users')

const { date } = require('../../lib/utils')

module.exports = {

    async list(req, res){
        
        let results = await Chefs.all()
        const chefs = results.rows
        
        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''
        
        return res.render("admin/chefs/list", { chefs, user, success } )
    },
    async listChefsHome(req, res){
        let results = await Chefs.all()
        const chefs = results.rows      
        
        return res.render("home/chefs", { chefs } )
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

        result = await Chefs.create(req.body)
        const id = result.rows[0].id

        return res.redirect("/chefs/list?msgSuccess=1")
    }, 
    async show(req, res){
        const chefId = req.params.id

        //Pega a receita na base de dados
        results = await Chefs.findChef(chefId)
        const chef = results.rows[0]        
        
        results = await Recipe.findRecipesPerChef(chefId)

        async function getImage(recipeId){
            let results = await Recipe.files(recipeId)
            const files = results.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            return files[0]
        }

        const recipesPromise = results.rows.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const recipes = await Promise.all(recipesPromise)                
        const totalRecipes = results.rowCount

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''

        return res.render("admin/chefs/show", { chef, recipes, totalRecipes, user, success } )

    },
    async edit(req, res){

        results = await Chefs.findChef(req.params.id)
        const chef = results.rows[0]

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        error = (req.query.msgError) ? 'Todos os campos devem ser preenchidos.' : ''

        return res.render('admin/chefs/edit', { chef, user, error })
        
    },
    async put(req, res){

        const keys = Object.keys(req.body)

        //Verifica se todos os campos estao preenchidos
        for(key of keys){
            if(req.body[key] == ""){
                return res.redirect(`/chefs/${req.body.id}/edit?msgError=1`)
            }
        }

        //Atualiza dados da receita
        results = await Chefs.updateChef(req.body)

        return res.redirect(`/chefs/show/${req.body.id}?msgSuccess=1`)
    },
    async delete(req, res){

        results = await Recipe.findRecipesPerChef(req.body.id)
        const recipePerChef = results.rows

        const allFilesPromise = recipePerChef.map(recipe => 
             Recipe.files(recipe.id))

        let promiseResults = await Promise.all(allFilesPromise)
     
        // remover as imagens da pasta public
        promiseResults.map(results => {
             results.rows.map(file => fs.unlinkSync(file.path))
        })

        await Chefs.delete(req.body.id)

        return res.redirect(`/chefs/list?msgSuccess=1`)

    }

}