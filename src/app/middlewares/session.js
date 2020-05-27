const User = require('../models/Users')
const Recipe = require('../models/Recipes')

async function redirectToLogin(req, res, next){

    if(!req.session.userId)
        return res.redirect('/users/login')       
    
    next()
}

async function verifyIfUserCreator(req, res, next){

    if(!req.session.userId)
        return res.redirect('/users/login')       

    id = req.session.userId
    const user = await User.findOne({where: {id}})

    results = await Recipe.findRecipe(req.params.id)
    const recipeUserId = results.rows[0].id_user

    if (user.id != recipeUserId) 
        return res.redirect('/recipes/list')
    
    next()
}


module.exports = {
    redirectToLogin,
    verifyIfUserCreator
}