const fs = require('fs')
const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')
const File = require('../models/File')
const Chefs = require('../models/Chefs')
const User = require('../models/Users')

module.exports = {
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
        
        const id = req.session.userId
        results = await User.findOne({where: {id}})
        const user = results.rows[0]
        
        return res.render('admin/recipes/list', { recipes: allRecipes, user } )
       
    },
    async create(req, res){

        let results = await Chefs.all()
        const chefs = results.rows

        const id = req.session.userId
        results = await User.findOne({where: {id}})
        const user = results.rows[0]

        return res.render('admin/recipes/create', {chefs, user})
    }, 
    async show(req, res){
        const RecipeId = req.params.id
        
        //Pega a receita na base de dados
        results = await Recipe.findRecipe(RecipeId)

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

        const id = req.session.userId
        results = await User.findOne({where: {id}})
        const user = results.rows[0]

        return res.render("admin/recipes/show", { recipe, ingreds, steps, files, user } )

    },
    async post(req, res){
        const keys = Object.keys(req.body)

        //Verifica se todos os campos estão preenchido
        for(key of keys){
            if(req.body[key] == ""){
                return res.render('admin/recipes/create', {
                    error: 'Por favor, complete todos os dados',
                    recipe: res.body
                })
            }
        }

        const data = {
            ...req.body,
            userId: req.session.userId
        }

        //Cadastra receita principal
        result = await Recipe.create(data)
        const id = result.rows[0].id

        // === Cadastra as imagens === //
        // Verifica se foi enviado alguma imagem
        if(req.files.length == 0)
            return res.render('admin/create', {
                error: 'Por favor, Envie pelo menos uma imagem',
                recipe: res.body
            })

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

        let results = await Chefs.all()

        return res.render('admin/recipes/create', {
            success: 'Receita cadastrada com sucesso!',
            chefs: results.rows
        })
           
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

        return res.redirect(`/recipes/show/${req.body.id}`)
        
    },
    async delete(req, res){
        const { id } = req.body

        results = await Recipe.files(id)
        const files = results.rows
       
        // remover as imagens da pasta public
        results.rows.map(file => fs.unlinkSync(file.path))
        
        //Remove da base de dados
        await Recipe.deleteRecipe(id)

        return res.redirect(`/recipes/list`)
    }

}