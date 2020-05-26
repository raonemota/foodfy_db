const db = require('../../config/db')
const { hash } = require('bcryptjs')

module.exports = {
    all(){
        return db.query('SELECT * FROM users')
    },
    findOne(filters){

        let query = "SELECT * FROM users"

        Object.keys(filters).map(key => {
            //WHERE | OR | AND
            query = `${query} ${key}`            

            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
            })
        })     
                
        return db.query(query)
    },
    registerUser(data){

        data.is_admin = data.is_admin || false       
       
        const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    is_admin
                ) VALUES ($1, $2, $3, $4)
            `

            const values = [
                data.name,
                data.email,
                data.token,
                data.is_admin
            ]

            return db.query(query, values)
    },
    async updateUser(data){

        if (data.status == 0) {
            const query = `UPDATE users SET name=($1), email=($2), password=($3), status=($4) WHERE id = ($5) RETURNING id`
            passwordHash = await hash(data.password, 8)        
            data.password = passwordHash 

            const values = [
                data.name,
                data.email,
                data.password,
                1,
                data.id
            ]
            return db.query(query, values)

        }else{
            const query = `UPDATE users SET name=($1), email=($2) WHERE id = ($3) RETURNING id`

            const values = [
                data.name,
                data.email,
                data.id
            ]
            
            return db.query(query, values)
            
        }   

    },
    delete(id){
        return db.query('DELETE FROM users WHERE id = $1', [id])
    },
    updateToken(data){     

        const query = `UPDATE users SET reset_token=($1), reset_token_expires=($2) WHERE id = ($3)`

        const values = [
            data.reset_token,
            data.reset_token_expires,
            data.id
        ]

        return db.query(query, values)
    },
    updatePassword(data){     

        const query = `UPDATE users SET password=($1), reset_token=($2), reset_token_expires=($3) WHERE id = ($4)`

        const values = [
            data.password,
            "",
            "",
            data.id
        ]

        return db.query(query, values)
    }

}