const Base = {
    init({ table }){
        if(!table) throw Error('Invalid Params')

        this.table = table

        return this
    },
    async findOne(filters) {
        let query = `SELECT * FROM ${this.table}`

        Object.keys(filters).map(key => {
            query = `${query}
            ${key}
            `

            Object.keys(filters[key].map(field = {
                query = `${query} ${field} = '${filters[key][field]}'`
            }))

        })
    },
    // async create(fields){

    //     try {
    //         let keys = [],
    //             values = []

    //         Object.keys(fields).map( key => {
    //             keys.push(key)
    //             values.push(fields[key])
    //         })

    //         const query = `INSERT INTO ${this.table} (${keys})
    //             VALUES (${values})
    //             RETURNING id`

    //         const results = await db.query(query)
    //         return results.rows[0].id

    //     } catch (error) {
            
    //     }
    // }

}

module.exports = Base