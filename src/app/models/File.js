const db = require('../../config/db')
const fs = require('fs')

module.exports = {

    create({filename, path, id_recipe}){
        const query = `
            INSERT INTO files (
                path,
                id_recipe,
                name
            ) VALUES ($1, $2, $3)
            RETURNING id
        `
        const values = [
            path,
            id_recipe,
            filename
        ]

        return db.query(query, values)
    },
    async delete(id) {

        try {

            const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id])
            const file = result.rows[0]

            fs.unlink(file.path, (err) => {
                if (err) throw err
                return db.query(`DELETE FROM files WHERE id = $1`, [id])
            })

        } catch(err){
            console.error(err);
            
        }

    }


}