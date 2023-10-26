const {TOKEN_LOGIN,
    TOKEN_REFRESH } = process.env

const jwt = require('jsonwebtoken') 

module.exports = {
    authenticateToken (req, res, next){
        let authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')[1]
        const token = bearerToken

        if(!authHeader) return res.status(403).json({
            message: "Unauthorized 1"
        })

        jwt.verify(token, TOKEN_LOGIN, (err, payload) => {
            if(err){
                return res.status(403).json({
                    err: err,
                    message: "Unauthorized 2"
                })
            }
            req.body.email = payload.email
            req.body.password = payload.password
            // console.log(payload)
            next()
       })
    }
}