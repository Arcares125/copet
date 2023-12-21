const {User, PenyediaJasa, Admin, sequelize, Sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const confirmRegister = async (req, res) =>{
    // const email = req.body.email
    // const password = req
    const { email, password } = req.body
    const value = req.params
    
    try {
        const getEmail = await Admin.findOne({
            where: {
                email: email
            },
            logging: true
        })

        if(!getEmail) return res.status(404).json({
            message: "Wrong email / password",
        })
        
        const comparePass = await bcrypt.compare(password, getEmail.password)
        if(!comparePass) return res.status(404).json({
            message: "Wrong email / password",
        })

        const user = {
            id: getEmail.id,
            email: getEmail.email,
            no_telp: getEmail.no_telp,
            username: getEmail.nama
        }

        const tokenLogin = jwt.sign(user, TOKEN_LOGIN, { expiresIn: '5m' })
        const refreshToken = jwt.sign(user, TOKEN_REFRESH, { expiresIn: '7d' })

        await User.update({ refreshToken: refreshToken },
            { where: { email: user.email} }
        )

        res.status(200).json({
            message: "Login Success",
            data: user,
            token: tokenLogin,
            refreshToken: refreshToken
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            message: "Invalid Email/Password"
        })
    }

}

module.exports = {
    loginAdmin,
}