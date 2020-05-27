const db = require('../../config/db')


module.exports = {

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