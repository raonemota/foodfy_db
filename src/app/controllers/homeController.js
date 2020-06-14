const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')
const Chefs = require('../models/Chefs')

module.exports = {
    async index(req, res){

        let results = await Recipe.findRecipesMoreAccessed()

        async function getImage(recipeId){
            let files = await Recipe.files(recipeId)
            files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            return files[0]
        }

        const recipesPromise = results.rows.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const recipes = await Promise.all(recipesPromise)  
                
        return res.render("home/index", { recipes })

    },
    about(req, res){
        return res.render("home/about")
    },
    async recipesList(req, res){

        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 6
        filter = filter || ''
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset
        }

        let results = await Recipe.paginate(params)

        async function getImage(recipeId){
            let files = await Recipe.files(recipeId)
            files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            return files[0]
        }

        const recipesPromise = results.rows.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const recipes = await Promise.all(recipesPromise)  

        return res.render("home/revenue", { recipes, filter})

    },
    async showRecipe(req, res){

        let recipe = await Recipe.findOne({where: {id: req.params.id}})
        
        async function getImage(recipeId){
            let files = await Recipe.files(recipeId)
            files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
           
            return files[0]
        }       

        recipe = {
            ...recipe,
            created_at: date(recipe.created_at).iso,
            img: await getImage(recipe.id)
        }  

        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        let files = await Recipe.files(recipe.id)
        files = files.map(file => ({
            ...file,
            path: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))        
        
        return res.render("home/show", { recipe, ingreds, steps, files } )

    },
    async listChefsHome(req, res){
        const chefs = await Chefs.all()    
        
        return res.render("home/chefs", { chefs } )
    }
}