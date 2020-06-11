const Recipe = require('../models/Recipes')
const File = require('../models/File')
const Chefs = require('../models/Chefs')
const User = require('../models/Users')

const fs = require('fs')
const { date } = require('../../lib/utils')

module.exports = {
    async list(req, res){
                
        const recipes = await Recipe.allList()

        if (!recipes) return res.send("Não foram encontrados receitas")

        async function getImage(recipeId){
            let files = await Recipe.files(recipeId)
            files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
            return files[0]
        }

        const recipesPromise = recipes.map(async recipe => {
            recipe.img = await getImage(recipe.id)
            recipe.created_at = date(recipe.created_at).iso
            return recipe
        })

        const allRecipes = await Promise.all(recipesPromise) 
        
        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''
        
        return res.render('admin/recipes/list', { recipes: allRecipes, user, success } )
       
    },
    async create(req, res){

        const chefs = await Chefs.all()

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        return res.render('admin/recipes/create', {chefs, user})
    }, 
    async post(req, res){
        
        //Verifica se todos os campos estão preenchido
        const keys = Object.keys(req.body)
        for(key of keys){
            if(req.body[key] == ""){
                return res.render('admin/recipes/create', {
                    error: 'Por favor, complete todos os dados',
                    recipe: res.body
                })
            }
        }

        // Verifica se foi enviado alguma imagem
        if(req.files.length == 0)
            return res.render('admin/create', {
                error: 'Por favor, Envie pelo menos uma imagem',
                recipe: res.body
            })

        
        const { title, additional_info, chef } = req.body

        result = await Recipe.create({
                                title,
                                additional_info,
                                created_at: date(Date.now()).format,
                                id_chef: chef,
                                id_user: req.session.userId
                            })

        //Cria todas as promises para cadastro dos arquivos
        const filesPromise = req.files.map(file => File.create({
            ...file, 
            id_recipe: result
        }))
        await Promise.all(filesPromise)

        //Cadastra todas os ingredientes cadastrados
        const ingredientes = req.body.ingredients     
        const addIngredPromise = ingredientes.map(ingred => Recipe.createIngred(ingred, result))
        await Promise.all(addIngredPromise)
        
        //Cadastra todas os etapas cadastradas
        const steps = req.body.method_of_preparation     
        const addStepsPromise = steps.map(step => Recipe.createSteps(step, result))
        await Promise.all(addStepsPromise)

        return res.redirect('/recipes/list?msgSuccess=1')
           
    },
    async show(req, res){
        
        let recipe = await Recipe.findOne({where: {id: req.params.id }})
        const creatorRecipe = await User.findOne({where: {id: recipe.id_user }})
        const chefRecipe = await Chefs.findOne({where: {id: recipe.id_chef }})

        recipe = {
            ...recipe,
            user: creatorRecipe.name,
            chef: chefRecipe.name,
            created_at: date(recipe.created_at).iso
        }  

        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        let files = await Recipe.files(recipe.id)
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        success = (req.query.msgSuccess) ? 'Ação foi executada com sucesso!' : ''

        return res.render("admin/recipes/show", { recipe, ingreds, steps, files, user, success } )

    },
    async edit(req, res){
        
        let recipe = await Recipe.findOne({where: {id:req.params.id}})

        recipe = {
            ...recipe,
            created_at: date(recipe.created_at).iso
        }      

        results = await Recipe.findIngred(recipe.id)
        const ingreds = results.rows

        results = await Recipe.findSteps(recipe.id)
        const steps = results.rows

        let files = await Recipe.files(recipe.id)
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        const chefs = await Chefs.all()

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        error = (req.query.msgError) ? 'Todos os campos devem ser preenchidos.' : ''

        return res.render('admin/recipes/edit', { recipe, ingreds, steps, files, chefs, user, error })
        
    },
    async put(req, res){

        try {
            
            const keys = Object.keys(req.body)
            for(key of keys){
                if(key != 'removed_files' && req.body[key] == ""){
                    return res.redirect(`/recipes/${req.body.id}/edit?msgError=1`)
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

            await Recipe.update(req.body.id, {
                title: req.body.title,
                additional_info: req.body.additional_info, 
                id_chef: req.body.chef
            })
            
            // === Atualiza imagens da receita
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

            return res.redirect(`/recipes/show/${req.body.id}?msgSuccess=1`)

        } catch (error) {
            console.log(error);   
        }
        
    },
    async delete(req, res){
        const { id } = req.body
        const files = await Recipe.files(id)

        // remover as imagens da pasta public
        files.map(file => fs.unlinkSync(file.path))
        
        await Recipe.delete(id)

        return res.redirect(`/recipes/list?msgSuccess=1`)
    }

}