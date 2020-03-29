const fs = require('fs')
const data = require('../../../data.json')
const db = require('../../config/db')
const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipes')

module.exports = {
    list(req, res){

        Recipe.all(function callback(recipes){

            return res.render('admin/list', { recipes } )
        })
       
    },
    create(req, res){
        return res.render('admin/create')
    }, 
    show(req, res){
        const { id } = req.params

       Recipe.find(id, function callback(auxRecipe){
           return res.render("admin/show", {auxRecipe} )
       })

    },
    post(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please, fill all fields!!")
            }
        }
        
        Recipe.create(req.body, function callback(){
            return res.redirect('create')
        })

    },
    edit(req, res){
        
        const { id } = req.params

        Recipe.findRecipe(id, function callback(recipeComplete){
            return res.render('admin/edit', { recipeComplete })
        })
        
    },
    put(req, res){

        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please. fill all fields!")
            }
        }

        Recipe.update(req.body, function(){
            return res.redirect(`/admin/show/${req.body.id}`)
        })
        
    }

}