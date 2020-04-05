const db = require('../../config/db')
const { date } = require('../../lib/utils')

module.exports = {
    all(callback){
        db.query(`SELECT * FROM recipes`, function(err, results){
            let auxDados = []
            if (err) throw `List all - Database Error! ${err}`

            for(recipe of results.rows){
                const auxRecipe = {
                    ...recipe,
                    created_at: date(recipe.created_at).iso
                }
                auxDados.push(auxRecipe)
            }

            callback(auxDados)
        })
    },
    find(id, callback){
        
        db.query(`SELECT * FROM recipes WHERE id = $1`,
                    [id], 
                    function(err, results){
                        if (err) throw `List all - Database Error! ${err}`
                        const recipe = {
                            ...results.rows[0],
                            created_at: date(results.rows[0].created_at).iso
                        }
                        db.query(`SELECT * FROM ingred_recipes WHERE id_recipe = $1`,
                            [results.rows[0].id], function(err, resultsIngred){
                                if (err) throw `Ingredients - Database Error! ${err}`
                                const resultsIng = resultsIngred.rows

                                db.query(`SELECT * FROM method_of_preparation WHERE id_recipe = $1`,
                                    [results.rows[0].id], function(err, resultsSteps){
                                        if (err) throw `Method - Database Error! ${err}`
                                        const resultsStep = resultsSteps.rows

                                        callback({recipe, resultsIng, resultsStep})
                                })
                                
                        })

                        
                    })
    },
    create(data, callback){
        //Monta Query principal para inserção de dados
        const query = `
            INSERT INTO recipes (
                recipe_img,
                title,
                additional_info,
                created_at
            ) VALUES ( $1, $2, $3, $4)
            RETURNING id 
        `
        const values = [
            data.img_recipe,
            data.title,
            data.aditional_info,
            date(Date.now()).format,
        ]

        db.query(query, values, function(err, results){
            if(err) throw `Database Error! ${err}`

            //Lista os ingredientes inseridos no base de dados
            for(ingredient of data.ingredients){
                db.query(`INSERT INTO ingred_recipes (
                            description,
                            id_recipe                        
                            ) VALUES ($1, $2)`, [ingredient, results.rows[0].id])
            }

            //Lista das etapas do metodo de preparação
            for(steps of data.method_of_preparation){
                db.query(`INSERT INTO method_of_preparation (
                            description,
                            id_recipe                        
                            ) VALUES ($1, $2)`, [steps, results.rows[0].id])
            }

            callback()
        })
    },
    findRecipe(id, callback){
              
        db.query(`
                SELECT * 
                FROM recipes
                WHERE id = $1`, 
                [id], 
                function(err, results) {
                    if (err) throw `Find - Database Error! ${err}`

                    const recipe = results.rows

                    db.query(`
                        SELECT * 
                        FROM ingred_recipes
                        WHERE id_recipe = $1`, [results.rows[0].id], 
                        function(err, resultsIng){
                            if (err) throw `FindIngredients - Database Error! ${err}`

                            const ingredients = resultsIng.rows

                            db.query(`
                                SELECT * 
                                FROM method_of_preparation
                                WHERE id_recipe = $1`, [results.rows[0].id], 
                                function(err, resultsStep){
                                    if (err) throw `FindMethod - Database Error! ${err}`

                                    const methods = resultsStep.rows

                                    callback({recipe, ingredients, methods})
                                })
                        }) 

                })

        
    },
    update(data, callback){
        
        //Atualiza os dados principais da receita
        const query = `UPDATE recipes SET
                        recipe_img=($1),
                        title=($2),
                        additional_info=($3)
                    WHERE id = ($4)`

                    const values = [
                        data.img_recipe,
                        data.title,
                        data.aditional_info,
                        data.id
                    ]

            db.query(query, values, function(err, results){
                if (err) throw `Database Error! ${err}`

                //Apaga registros dos ingredients associados ao id
                db.query(`DELETE FROM ingred_recipes 
                            WHERE id_recipe = ($1)`, 
                        [data.id], 
                        function(err, results){
                            if (err) throw `Delete item Database Errossr! ${err}`
                            
                            //Lista os ingredientes inseridos no base de dados
                            for(ingredient of data.ingredients){
                                if(ingredient != ''){
                                    db.query(`INSERT INTO ingred_recipes (
                                                description,
                                                id_recipe                        
                                                ) VALUES ($1, $2)`, [ingredient, data.id])
                                }
                            }
                        
                        })

                //Apaga registros dos passos associados ao id
                db.query(`DELETE FROM method_of_preparation 
                            WHERE id_recipe = ($1)`, 
                        [data.id], 
                        function(err, results){
                            if (err) throw `Delete item Database Error! ${err}`
                            
                            //Lista os ingredientes inseridos no base de dados
                            for(step of data.method_of_preparation){
                                if(step != ''){
                                    db.query(`INSERT INTO method_of_preparation (
                                                description,
                                                id_recipe                        
                                                ) VALUES ($1, $2)`, [step, data.id])
                                }
                            }
                        
                        })

                callback()

            })

    },
    paginate(params){
        
        const { filter, limit, offset, callback } = params

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
                    LIMIT $1 OFFSET $2
                `
                db.query(query, [limit, offset], function(err, results){
                    if (err) throw 'Paginate - Database Error!'

                    //Verifica se tem foi retornado alguma receita
                    if (results.rowCount == 0) {
                        const results = [{
                            total: 0
                        }]
                        
                        callback(results)
                        //console.log(teste)
                    }else{
                        callback(results.rows)
                    }

                })

    }

}