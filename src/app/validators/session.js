const User = require('../models/Users')
const { compare } = require('bcryptjs')

async function newRegisterUser(req, res, next){
    
    const { email } = req.body
    
    const keys = Object.keys(req.body)
    
    //Verifica se todos os campos estão preenchido
    for(key of keys){
        if(req.body[key] == ""){
            return res.render('admin/users/register', {
                error: 'Todos os campos devem estar preenchidos'
            })
        }
    }
    
    //Verifica se já existe usuário cadastrado
    const userFind = await User.findOne({where: {email}})

    if(userFind){
        return res.render('admin/users/register', {
            error: 'Este usuário já existe.'
        })
    }

    next()


}

async function updateUser(req, res, next){
    
    const keys = Object.keys(req.body)

    const user = req.body
    
    //Verifica se todos os campos estão preenchido
    for(key of keys){
        if(req.body[key] == ""){
            return res.render('admin/users/edit', {
                error: 'Todos os campos devem estar preenchidos',
                user
            })
        }
    }
    
    //Verifica se a senha esta correta.
    if (user.status == '1') {
        const id = user.id
        const userData = await User.findOne({ where: {id}})

        const passed = await compare(user.password, userData.password)
        
        if(!passed){
            return res.render('admin/users/edit', {
                error: 'A senha digitada não está correta. Favor tentar novamente.',
                user: userData
            })
        } 
    }
    
    next()

}

async function updateChefs(req, res, next){
        
    const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.redirect(`/chefs/${req.body.id}/edit?msgError=1`)
            }
        }
    
    next()

}

async function updateRecipes(req, res, next){   
    
    const keys = Object.keys(req.body)

    for(key of keys){
        if(key != 'removed_files' && req.body[key] == ""){
            return res.redirect(`/recipes/${req.body.id}/edit?msgError=1`)
        }
    }
    
    next()

}

async function loginUser(req, res, next){

    const { email, password } = req.body

    const keys = Object.keys(req.body)

    //Verifica se todos os campos estão preenchido
    for(key of keys){
        if(req.body[key] == ""){
            return res.render('admin/users/login', {
                error: 'Todos os campos devem estar preenchidos',
                user,
                err: 'allErr' 
            })
        }
    }
    
    //Verifica se o email está cadastrado
    const user  = await User.findOne({where: {email}})

    if(!user){
        return res.render('admin/users/login', {
            error: 'O email digitado não está cadastrado.',
            user: req.body,
            err: 'email'
        })
    }else{      

        const passed = await compare(password, user.password)
        
        if(!passed){
            return res.render('admin/users/login', {
                error: 'A senha digitada não está correta. Favor tentar novamente.',
                user: req.body,
                err: 'pass'
            })
        } 

        req.user = user

        next()

    } 

}

async function forgot(req, res, next){

    const { email, password, passwordRepeat, token } = req.body
    
    const keys = Object.keys(req.body)
    
    //Verifica se todos os campos estão preenchido
    for(key of keys){
        
        if(req.body[key] == "" && key != 'token'){
            return res.render('admin/users/password-reset', {
                error: 'Todos os campos devem estar preenchidos',
                user: req.body,
                err: 'allErr',
                token
            })
        }
    }
    
    const user = await User.findOne({ where: { email }})

    //Verifica se o email está cadastrado
    if(!user) return res.render('admin/users/password-reset', {
        error: 'O email digitado não está cadastrado.',
        user: req.body, 
        err: 'email',
        token
        
    })
    
    //Verifica se os passwords são iguais
    if (password != passwordRepeat) return res.render('admin/users/password-reset', {
        error: 'As senhas não conferem.',
        user: req.body,
        err: 'pass',
        token
    })
    
    
    //Verifica se o token confere
    if (token != user.reset_token) return res.render('admin/users/password-reset', {
        error: 'Token inválido! Solicite uma nova recuperação de senha.',
        user: req.body,
        token
    })

    //Verifica se o token não expirou
    let now = new Date()
    now = now.setHours(now.getHours())
    if (now > user.reset_token_expires) return res.render('admin/users/password-reset', {
        error: 'Token expirado! Solicite uma nova recuperação de senha.',
        user: req.body
    })

    next()

}

module.exports = {
    newRegisterUser,
    updateUser,
    updateChefs,
    updateRecipes,
    loginUser,
    forgot
}