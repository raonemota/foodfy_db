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

    const recipeUserId = await Recipe.findOne({where: {id: req.params.id }} )

    if (user.id != recipeUserId.id_user) 
        return res.redirect('/recipes/list')
    
    next()
}


module.exports = {
    redirectToLogin,
    verifyIfUserCreator
}