const User = require('../models/Users')
const crypto = require('crypto') 
const mailer = require('../../lib/mailer')

const { hash } = require('bcryptjs')

module.exports = {
    async list(req, res){

        results = await User.all()
        const users = results.rows 
        
        //Pega o usuario
        results = await User.findOneId(req.session.userId)
        const user = results.rows[0]

        return res.render("admin/users/list", { users, user })
    },
    async post(req, res){

        const token = crypto.randomBytes(6).toString("hex")

        const { name, email } = req.body
        
        const data = {
            ...req.body,
            token: token
        }   
        
        try {
            results = await User.registerUser(data)

            await mailer.sendMail({
                to: email,
                from: 'no-reply@fodfy.com.br',
                subject: 'Novo cadastro no site',
                html: `<h2>Olá, ${name},</h2>
                        <p>Seu cadastro foi efetuado no site do <b>Foodfy</b>.</p>
                        <p>É necessário que você cadastre uma nova senha, basta acessar o site: <a href="http://localhost:3000/users/edit?token=${token}" target="_blank">Criar senha</a>`
            })

            results = await User.all()
            const users = results.rows

            return res.render("admin/users/list", {
                success: 'Usuário foi cadastrado com sucesso',
                users
            })

        } catch (err) {
            return res.render("admin/users/register", {
                error: `Ocorreu um erro no sistema: ${err}`,
                user: data
            }) 
            
        }

    },
    registerForm(req, res){
        return res.render("admin/users/register") 
    },
    async editForm(req, res){

        try {
            
            const token = req.query.token
            
            if(!token){ 
                return res.redirect("/")
            }

            results = await User.findByToken(token)
            const user = results.rows[0]

            if(results.rowCount > 0){
                return res.render("admin/users/edit", { user, token }) 
            }else{
                return res.redirect("/")
                
            }
            
        } catch (error) {
            return res.render("admin/users/register", {
                error: `Ocorreu um erro [atualizacao com token]: ${err}`,
                user: data
            }) 
        }
        
        
    },
    async editUser(req, res){

        try {
            
            const { id } = req.params
            
            results = await User.findOneId(id)
            const user = results.rows[0]            

            if(!user)
                return res.redirect("admin/users/list")

            return res.render("admin/users/edit", { user })
            
        } catch (err) {
            return res.render("admin/users/list", {
                error: `Ocorreu um erro no sistema: ${err}`,
                user
            }) 
        }
        
        
    },
    async updateFormNewUser(req, res){

        try {
            
            const data = req.body
            
            results = await User.updateUser(data)
           
            req.session.userId = results.rows[0].id

            return res.redirect("/users/list") 
            
        } catch (error) {
           
            return res.render("/users/list", {
                error: `Ocorreu um erro no sistema: ${error}`,
                user: req.body
            }) 
        }
        
        
    },
    async deleteUser(req, res){
       
        const { id } = req.body

        try {
            await User.deleteUser(id)

            results = await User.all()
            const users = results.rows

            return res.render("admin/users/list", {
                success: 'Usuário foi excluído com sucesso',
                users
            }) 

        } catch (err) {
            return res.render("admin/users/list", {
                error: `Ocorreu um erro no sistema: ${err}`,
            }) 
        }
        
    },
    async loginForm(req, res){

        if (req.session.userId) {         
            return res.redirect('/admin/list' )

        }else{            
            return res.render("admin/users/login")
        }
    },
    async postLogin(req, res){
        req.session.userId = req.user.id        
        return res.redirect('/admin/list')  
    },
    logout(req, res){
        req.session.destroy()
        return res.redirect("/users/login")
    },  
    resetForm(req, res){       
        return res.render("admin/users/password-reset", { token: req.query.token})
    },
    forgotForm(req, res){
        return res.render("admin/users/forgot-password")
    },
    async forgot(req, res){

        try {

            const { email } = req.body

            let results = await User.findOne(email)
            const user = results.rows

            if(!user){
                return res.render('/admin/users/forgot-password', {
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

            results = await User.updateToken(user)   
            
            await mailer.sendMail({
                to: email,
                from: 'no-reply@fodfy.com.br',
                subject: 'Recuperação de senha',
                html: `<h2>Olá, ${user[0].name},</h2>
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
    async reset(req, res){

        const { email, password } = req.body        

        try {

            let newPassword = await hash(password, 8)

            results = await User.findUser(email)
            const user = {
                ...results.rows[0],
                password: newPassword
            }         
            
            await User.updatePassword(user)

            return res.redirect('users/login')
            
        } catch (error) {
            return res.render('admin/users/password-reset', {
                error: `Ocorreu um erro: ${error}`,
                user: req.body
            })
        }


    }
    
}