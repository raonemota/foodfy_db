const db = require('../../config/db')
const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')
const File = require('../models/File')

module.exports = {
    index(req, res){

        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 6
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(recipes){
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }

                return res.render("./revenue", { recipes, pagination, filter})

            }
        }

        Recipe.paginate(params)

    },
    async list(req, res){

        results = await Recipe.all()
        const aux_recipes = results.rows.map(recipe => ({
            ...recipe,
            created_at: date(recipe.created_at).iso
        }))
        await Promise.all(aux_recipes)

        imgs = []
        for (item of aux_recipes){
            result = await Recipe.fileSingle(item.id)
            imgs.push(result.rows)
        }
        
        console.log(imgs)        
        
        return res.render('admin/list', { aux_recipes } )
       
    },
    create(req, res){
        return res.render('admin/create')
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

        return res.render("admin/show", { recipe, ingreds, steps, files } )

    },
    async showRecipe(req, res){
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

        return res.render("show", { recipe, ingreds, steps } )

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

        return res.render('admin/edit', { recipe, ingreds, steps, files })
        
    },
    async put(req, res){

        const keys = Object.keys(req.body)

        //Verifica se todos os campos estao preenchidos
        for(key of keys){
            if(req.body[key] == ""){
                return res.send(`Please. fill all fields!${req.body[key]}`)
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

        return res.redirect(`/admin/show/${req.body.id}`)
        
    }

}