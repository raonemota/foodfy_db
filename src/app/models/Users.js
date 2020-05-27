const db = require('../../config/db')
const { hash } = require('bcryptjs')

const Base = require('./Base')

Base.init({ table: 'users'})

module.exports = {
    ...Base,
    create(data){

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
    async update(data){

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
    }

}