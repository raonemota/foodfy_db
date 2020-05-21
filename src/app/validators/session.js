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
    results = await User.findOne(email)
    const userFind = results.rowCount

    if(userFind > 0){
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
        results = await User.findOneId(user.id)
        const userData = results.rows[0]
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

async function loginUser(req, res, next){
    
    const user = req.body
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
    results = await User.findOne(user.email)
    const emailUser = results.rows[0]

    if(!emailUser){
        return res.render('admin/users/login', {
            error: 'O email digitado não está cadastrado.',
            user,
            err: 'email'
        })
    }else{

        //Verifica se a senha esta correta.
        results = await User.findOneId(emailUser.id)
        const userData = results.rows[0]
        const passed = await compare(user.password, userData.password)
        
        if(!passed){
            return res.render('admin/users/login', {
                error: 'A senha digitada não está correta. Favor tentar novamente.',
                user: userData,
                err: 'pass'
            })
        } 

        req.user = userData     

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
    
    results = await User.findUser(email)
    const user = results.rows[0]

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
    loginUser,
    forgot
}