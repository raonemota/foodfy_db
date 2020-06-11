const db = require('../../config/db')
const { date } = require('../../lib/utils')

const Base = require('./Base')

Base.init({ table: 'chefs'})

module.exports = {
    ...Base,
    async all(){
        const results = await db.query(`SELECT (select count(*) FROM recipes WHERE id_chef = chefs.id) as total, * FROM chefs`)
        return results.rows
    }
}