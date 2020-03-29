const { Pool } = require('pg')

module.exports = new Pool({
    user: 'postgres',
    password: '131729',
    host: 'localhost',
    port: 5432,
    database: 'recipesmanager'
})