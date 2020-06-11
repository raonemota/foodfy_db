const db = require('../../config/db')
const { date } = require('../../lib/utils')

const Base = require('./Base')

Base.init({ table: 'recipes'})

module.exports = {
    ...Base,
    async allList(){
        const results = await db.query(`SELECT R.*, C.name as chef, U.name as user 
                                                        FROM recipes as R
                                        INNER JOIN chefs AS C
                                        ON C.id = R.id_chef
                                        INNER JOIN users AS U
                                        ON U.id = R.id_user`)
        return results.rows
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
    findIngred(id){
        return db.query(`SELECT * FROM ingred_recipes WHERE id_recipe = $1`, [id])
    },
    findSteps(id){
        return db.query(`SELECT * FROM method_of_preparation WHERE id_recipe = $1`, [id])
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

        query = `SELECT recipes.*, ${totalQuery}, chefs.name as chefname
                    FROM recipes
                    INNER JOIN chefs
                    ON recipes.id_chef = chefs.id
                    ${filterQuery}
                `

        return db.query(query)

    },
    findRecipesMoreAccessed(){
        query = `SELECT recipes.*, chefs.name as chefname FROM recipes
                    INNER JOIN chefs
                    ON recipes.id_chef = chefs.id
                    LIMIT 6`
        return db.query(query)
    },
    async files(id){
        const results = await db.query(`SELECT * FROM files WHERE id_recipe = $1`, [id])
        return results.rows
    }

}