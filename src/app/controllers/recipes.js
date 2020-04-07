const db = require('../../config/db')
const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')

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
    list(req, res){

        Recipe.all(function callback(recipes){

            return res.render('admin/list', { recipes } )
        })
       
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

        return res.render("admin/show", { recipe, ingreds, steps } )

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

        for(key of keys){
            
            if(req.body[key] == ""){
                return res.send(`Please. fill all fields!`)
            }
        }

        //Cadastra receita principal
        result = await Recipe.create(req.body)
        const id = result.rows[0].id

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

        return res.render('admin/edit', { recipe, ingreds, steps })
        
    },
    put(req, res){

        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send(`Please. fill all fields!${req.body[key]}`)
            }
        }

        Recipe.update(req.body, function(){
            return res.redirect(`/admin/show/${req.body.id}`)
        })
        
    }

}