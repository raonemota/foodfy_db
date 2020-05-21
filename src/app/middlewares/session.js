const User = require('../models/Users')

async function redirectToLogin(req, res, next){

    if(!req.session.userId)
        return res.redirect('/users/login')

    results = await User.findOneId(req.session.userId)
    const user = results.rows[0]

    if (user.is_admin != 1) 
        return res.redirect('/admin/list')

    
    next()
}

module.exports = {
    redirectToLogin
}