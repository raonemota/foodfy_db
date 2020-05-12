const fs = require('fs')
const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')
const File = require('../models/File')
const Chefs = require('../models/Chefs')

module.exports = {
    async index(req, res){

        let results = await Recipe.findRecipesMoreAccessed()

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

        return res.render("home/revenue", { recipes, filter})

    },
    async list(req, res){

        let results = await Recipe.all()
        const recipes = results.rows
        
        if (!recipes) return res.send("Não foram encontrados receitas")

        async function getImage(recipeId){
            let results = await Recipe.files(recipeId)
            const files = results.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            
            return files[0]
        }

        const recipesPromise = recipes.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const allRecipes = await Promise.all(recipesPromise)         
        
        return res.render('admin/recipes/list', { recipes: allRecipes } )
       
    },
    async create(req, res){

        let results = await Chefs.all()
        const chefs = results.rows

        return res.render('admin/recipes/create', {chefs})
    }, 
    async show(req, res){
        const { id } = req.params

        //Pega a receita na base de dados
        results = await Recipe.findRecipe(id)

        //Formata data
        const recipe = {
            ...results.rows[0],
            created_at: date(results.rows[0].created_at).iso
        }  

        //Pega os ingredientes com base no ID da receita
        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        //Pega as etapas para preparação com base no ID da receita
        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        results = await Recipe.files(recipe.id)
        const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        return res.render("admin/recipes/show", { recipe, ingreds, steps, files } )

    },
    async showRecipe(req, res){
        const { id } = req.params

        //Pega a receita na base de dados
        results = await Recipe.findRecipe(id)

        async function getImage(recipeId){
            let results = await Recipe.files(recipeId)
            const files = results.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
           
            return files[0]
        }       

        //Formata data
        const recipe = {
            ...results.rows[0],
            created_at: date(results.rows[0].created_at).iso,
            img: await getImage(results.rows[0].id)
        }  

        //Pega os ingredientes com base no ID da receita
        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        //Pega as etapas para preparação com base no ID da receita
        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        results = await Recipe.files(recipe.id)
        const files = results.rows.map(file => ({
            ...file,
            path: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))        
        
        return res.render("home/show", { recipe, ingreds, steps, files } )

    },
    async post(req, res){
        const keys = Object.keys(req.body)

        //Verifica se todos os campos estão preenchido
        for(key of keys){
            if(req.body[key] == ""){
                return res.send(`Please. fill all fields!`)
            }
        }

        //Cadastra receita principal
        result = await Recipe.create(req.body)
        const id = result.rows[0].id

        // === Cadastra as imagens === //
        // Verifica se foi enviado alguma imagem
        if(req.files.length == 0)
            return res.send('Please, send at least one image')

        //Cria todas as promises para cadastro dos arquivos
        const filesPromise = req.files.map(file => File.create({
            ...file, 
            id_recipe: id
        }))
        await Promise.all(filesPromise)

        //Cadastra todas os ingredientes cadastrados
        const ingredientes = req.body.ingredients     
        const addIngredPromise = ingredientes.map(ingred => Recipe.createIngred(ingred, id))
        await Promise.all(addIngredPromise)
        
        //Cadastra todas os etapas cadastradas
        const steps = req.body.method_of_preparation     
        const addStepsPromise = steps.map(step => Recipe.createSteps(step, id))
        await Promise.all(addStepsPromise)

        return res.redirect(`list`)
        
        
    },
    async edit(req, res){
        
        const { id } = req.params

        //Pega a receita na base de dados
        results = await Recipe.findRecipe(id)

        //Formata data
        const recipe = {
            ...results.rows[0],
            created_at: date(results.rows[0].created_at).iso
        }      

        //Pega os ingredientes com base no ID da receita
        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        //Pega as etapas para preparação com base no ID da receita
        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        //Pega as imagem cadatradadas na receita
        results = await Recipe.files(recipe.id)
        const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        results = await Chefs.all()
        const chefs = results.rows

        return res.render('admin/recipes/edit', { recipe, ingreds, steps, files, chefs })
        
    },
    async put(req, res){

        const keys = Object.keys(req.body)

        //Verifica se todos os campos estao preenchidos
        for(key of keys){
            
            if(key != 'removed_files' && req.body[key] == ""){
                return res.send(`Please. fill all fields!`)
            }
        }

        await Recipe.deleteIngreds(req.body.id)
        await Recipe.deleteSteps(req.body.id)
        
        //Cadastra todas os ingredientes cadastrados
        const ingredientes = req.body.ingredients     
        
        const addIngredPromise = ingredientes.map(ingred => Recipe.createIngred(ingred, req.body.id))
        await Promise.all(addIngredPromise)
        
        //Cadastra todas os etapas cadastradas
        const steps = req.body.method_of_preparation     
        const addStepsPromise = steps.map(step => Recipe.createSteps(step, req.body.id))
        await Promise.all(addStepsPromise)

        //Atualiza dados da receita
        await Recipe.updateRecipe(req.body)
        
        // === Atualiza imagens da receita
        // Verifica se tem dados na var removed_files
        if(req.body.removed_files){
            // Remove vírgula do final da array
            const removedFiles = req.body.removed_files.split(",")
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)

            const removedFilesPromise = removedFiles.map(id => File.delete(id))

            await Promise.all(removedFilesPromise)
        }

        //Cria todas as promises para cadastro dos arquivos
        const filesPromise = req.files.map(file => File.create({
            ...file, 
            id_recipe: req.body.id
        }))
        await Promise.all(filesPromise)

        return res.redirect(`/admin/show/${req.body.id}`)
        
    },
    async delete(req, res){
        const { id } = req.body

        results = await Recipe.files(id)
        const files = results.rows
       
        // remover as imagens da pasta public
        results.rows.map(file => fs.unlinkSync(file.path))
        
        //Remove da base de dados
        await Recipe.deleteRecipe(id)

        return res.redirect(`/admin/list`)
    }

}