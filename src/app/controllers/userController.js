const User = require('../models/Users')
const crypto = require('crypto') 
const mailer = require('../../lib/mailer')


module.exports = {
    async list(req, res){

        const users = await User.findAll()

        const id = req.session.userId
        const user = await User.findOne({ where: {id}})

        success = (req.query.msgSuccess) ? 'Ação executada com sucesso!' : ''
        error = (req.query.msgError) ? 'Ocorreu algum erro.' : ''

        return res.render("admin/users/list", { users, user, success, error })
    },
    async register(req, res){

        const id = req.session.userId
        const user = await User.findOne({where: {id}})

        return res.render("admin/users/register", { user }) 
    },
    async post(req, res){

        const token = crypto.randomBytes(6).toString("hex")

        const { name, email } = req.body
        
        const data = {
            ...req.body,
            token: token
        }   
        
        try {
            results = await User.create(data)

            await mailer.sendMail({
                to: email,
                from: 'no-reply@fodfy.com.br',
                subject: 'Novo cadastro no site',
                html: `<h2>Olá, ${name},</h2>
                        <p>Seu cadastro foi efetuado no site do <b>Foodfy</b>.</p>
                        <p>É necessário que você cadastre uma nova senha, basta acessar o site: <a href="http://localhost:3000/users/edit?token=${token}" target="_blank">Criar senha</a>`
            })

            const users = await User.all()

            return res.render("admin/users/register", {
                success: 'Usuário foi cadastrado com sucesso. Email enviado com solicitação de nova senha.',
                users
            })

        } catch (err) {
            return res.render("admin/users/register", {
                error: `Ocorreu um erro no sistema: ${err}`,
                user: data
            }) 
            
        }

    },
    async editFirstTIme(req, res){

        try {
            
            const password = req.query.token
            
            if(!password){ 
                return res.redirect("/")
            }
            
            const user = await User.findOne({where: {password}})      

            if(results.rowCount > 0){
                return res.render("admin/users/edit", { user, token: password }) 
            }else{
                return res.redirect("/")
            }
            
        } catch (error) {
            return res.render("admin/users/register", {
                error: `Ocorreu um erro [atualizacao com token]: ${error}`
            }) 
        }
        
        
    },
    async edit(req, res){

        try {
            
            const { id } = req.params
            const user = await User.findOne({where: {id}})           

            if(!user)
                return res.redirect("/users/list?msgError=1")

            error = (req.query.msgError) ? 'Todos os campos devem ser preenchidos.' : ''

            return res.render("admin/users/edit", { user, error })
            
        } catch (err) {
            return res.render("admin/users/list", {
                error: `Ocorreu um erro no sistema: ${err}`,
                user
            }) 
        }
        
        
    },
    async update(req, res){

        try {
            
            const data = req.body
            results = await User.update(data)
           
            req.session.userId = results.rows[0].id

            return res.redirect("/users/list?msgSuccess=1") 
            
        } catch (error) {
           
            return res.render("/users/list", {
                error: `Ocorreu um erro no sistema: ${error}`,
                user: req.body
            }) 
        }   
        
    },
    async delete(req, res){
       
        const { id } = req.body

        try {
            await User.delete(id)

            const users = await User.all()

            return res.redirect("/users/list?msgSuccess=1") 

        } catch (err) {
            return res.render("/admin/users/list", {
                error: `Ocorreu um erro no sistema: ${err}`,
            }) 
        }
        
    }
    
}