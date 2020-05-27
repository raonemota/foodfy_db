const User = require('../models/Users')
const crypto = require('crypto') 
const mailer = require('../../lib/mailer')

const { hash } = require('bcryptjs')

module.exports = {
    
    async loginForm(req, res){  

        if (req.session.userId) {         
            return res.redirect('/recipes/list' )

        }else{            
            return res.render("admin/users/login")
        }
    },
    async postLogin(req, res){ 
        req.session.userId = req.user.id        
        return res.redirect('/recipes/list')  
    },
    logout(req, res){
        req.session.destroy()
        return res.redirect("/users/login")
    },
    forgotForm(req, res){
        return res.render("admin/users/forgot-password")
    },
    async forgot(req, res){

        try {

            const { email } = req.body

            const user = await User.findOne({ where: {email} })

            if(!user){
                return res.render('admin/users/forgot-password', {
                    error: 'Este email não está cadastrado no sistema.',
                    user: req.body,
                    err: 'pass'
                })
            }
            
            const token = crypto.randomBytes(20).toString("hex")
            let now = new Date()
            now = now.setHours(now.getHours() + 1)   
                        
            user.reset_token = token
            user.reset_token_expires = now               

            results = await Session.updateToken(user)   
            
            await mailer.sendMail({
                to: email,
                from: 'no-reply@fodfy.com.br',
                subject: 'Recuperação de senha',
                html: `<h2>Olá, ${user.name},</h2>
                        <p>Perdeu sua <b>senha</b>?</p>
                        <p>Para recuperar sua senha, basta 
                        <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">Clicar aqui</a>`
            })
            
            return res.render('admin/users/forgot-password', {
                success: 'Email de recuperação enviado com sucesso!'
            })

            
        } catch (error) {         
            return res.render('admin/users/forgot-password', {
                error: `Ocorreu um erro: ${error}`,
                user: req.body
            })
            
        }
    },
    async resetForm(req, res){
        
        reset_token = req.query.token
        const user  = await User.findOne({ where: {reset_token} })
        
        return res.render("admin/users/password-reset", { token: req.query.token, user })
    },
    async reset(req, res){

        const { email, password } = req.body
        try {

            let newPassword = await hash(password, 8)

            const user  = await User.findOne( {where: {email} })
            user = {
                password: newPassword
            }         
            
            await Session.updatePassword(user)

            return res.redirect('/users/login')
            
        } catch (error) {
            return res.render('admin/users/password-reset', {
                error: `Ocorreu um erro: ${error}`,
                user: req.body
            })
        }


    }
    
}