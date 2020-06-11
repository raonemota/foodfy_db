const User = require('../models/Users')
const crypto = require('crypto') 
const mailer = require('../../lib/mailer')
const { hash } = require('bcryptjs')


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
        
        try {

            const token = crypto.randomBytes(6).toString("hex")

            const { name, email, is_admin } = req.body
            
            const results = await User.create({
                name,
                email,
                password: token,
                is_admin: is_admin || false
            })


            await mailer.sendMail({
                to: email,
                from: 'no-reply@fodfy.com.br',
                subject: 'Novo cadastro no site',
                html: `<h2>Olá, ${name},</h2>
                        <p>Seu cadastro foi efetuado no site do <b>Foodfy</b>.</p>
                        <p>É necessário que você cadastre uma nova senha, basta acessar o site: <a href="http://localhost:3000/users/edit?token=${token}" target="_blank">Criar senha</a>`
            })

            return res.redirect("/users/list?msgSuccess=1")

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

            if(user){
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

            //Usuário logado
            const user = await User.findOne({where: {id: req.session.userId}})

            //Usuário a ser editado
            const profile = await User.findOne({where: {id: req.params.id}})           

            if(!profile)
                return res.redirect("/users/list?msgError=1")

            error = (req.query.msgError) ? 'Todos os campos devem ser preenchidos.' : ''

            return res.render("admin/users/edit", { profile, user, error })
            
        } catch (err) {
            return res.render("admin/users/list", {
                error: `Ocorreu um erro no sistema: ${err}`,
            }) 
        }
        
        
    },
    async update(req, res){

        try {

            if (req.body.status == 0) {
                await User.update(req.body.id, {
                    name: req.body.name, 
                    email: req.body.email,
                    password: await hash(req.body.password, 8), 
                    status: 1
                })
            } else {
                await User.update(req.body.id, {
                    name: req.body.name, 
                    email: req.body.email,
                })                
            }

            return res.redirect("/users/list?msgSuccess=1") 
            
        } catch (error) {
           
            return res.render("/users/list", {
                error: `Ocorreu um erro no sistema: ${error}`,
                user: req.body
            }) 
        }   
        
    },
    async delete(req, res){
       
        try {
            await User.delete(req.body.id)

            return res.redirect("/users/list?msgSuccess=1") 

        } catch (err) {
            return res.redirect("/users/list?msgError=1") 
        }
        
    }
    
}