const db = require('../../config/db')
const { date } = require('../../lib/utils')

module.exports = {
    all(){
       return db.query(`SELECT * FROM recipes`)
    },
    create(data){
        //Monta Query principal para inserção de dados
        const query = `INSERT INTO recipes (
                            title,
                            additional_info,
                            created_at) VALUES ( $1, $2, $3) 
                        RETURNING id `

        const values = [
            data.title,
            data.aditional_info,
            date(Date.now()).format,
        ]

        return db.query(query, values)
        
    },
    createIngred(ingred, id_recipe){

        //Insere na base de dados os ingredientes
        db.query(`INSERT INTO ingred_recipes (description, id_recipe) 
                    VALUES ($1, $2)`, [ingred, id_recipe])

    },
    createSteps(steps, id){

        //Insere na base de dados as etapas de preparo
        return db.query(`INSERT INTO method_of_preparation (description, id_recipe) 
                            VALUES ($1, $2)`, [steps, id])

    },
    findRecipe(id){
        return db.query(`SELECT * FROM recipes WHERE id = $1`, [id] )
    },
    findIngred(id){
        return db.query(`SELECT * FROM ingred_recipes WHERE id_recipe = $1`, [id])
    },
    findSteps(id){
        return db.query(`SELECT * FROM method_of_preparation WHERE id_recipe = $1`, [id])
    },
    updateRecipe(data){
                
        //Atualiza os dados principais da receita
        const query = `UPDATE recipes SET title=($1), additional_info=($2)
                            WHERE id = ($3)`

                    const values = [
                        data.title,
                        data.aditional_info,
                        data.id
                    ]

            return db.query(query, values)

    },
    deleteIngreds(id){
        db.query(`DELETE FROM ingred_recipes WHERE id_recipe = ($1)`, [id])
    },
    deleteSteps(id){
        db.query(`DELETE FROM method_of_preparation WHERE id_recipe = ($1)`, [id])
    },
    paginate(params){
        
        const { filter } = params

        let query = "",
        filterQuery = "",
        totalQuery = '(SELECT count(*) FROM recipes) AS total'

        if ( filter ) {

            filterQuery = `${query}
                    WHERE recipes.title ILIKE '%${filter}%'`
            
            totalQuery = `(
                SELECT count(*) 
                FROM recipes ${filterQuery}) AS total`

        }

        query = `SELECT recipes.*, ${totalQuery}
                    FROM recipes
                    ${filterQuery}
                `
        
        return db.query(query)

    },
    files(id){
        return db.query(`SELECT * FROM files WHERE id_recipe = $1`, [id])
    }

}