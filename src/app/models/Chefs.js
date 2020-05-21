const db = require('../../config/db')
const { date } = require('../../lib/utils')

module.exports = {
    all(){
        return db.query(`SELECT (select count(*) FROM recipes WHERE id_chef = chefs.id) as total, * FROM chefs`)
    },
    create(data){
        
        const query = `INSERT INTO chefs (
                            name,
                            avatar_url,
                            created_at) VALUES ($1, $2, $3) 
                        RETURNING id`

        const values = [
            data.name,
            data.avatar_url,
            date(Date.now()).format,
        ]

        return db.query(query, values)
    },
    findChef(id){
        return db.query(`SELECT * FROM chefs WHERE id = $1`, [id] )
    },
    updateChef(data){
        //Atualiza os dados principais da receita
        const query = `UPDATE chefs SET name=($1), avatar_url=($2) WHERE id = ($3)`

        const values = [
            data.name,
            data.avatar_url,
            data.id
        ]

        return db.query(query, values)
    },
    delete(id){
        return db.query('DELETE FROM chefs WHERE id = $1', [id])
    },
}