// const { Sequelize } = require('sequelize');
const {User} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const getProfile = async (req, res) =>{
    const { email, password } = req.body
    
    try {
        const getEmail = await User.findOne({
            where: {
                email: email
            },
            attributes: ['nama', 'email', 'noTelp', 'gender', 'createdAt']
        })

        if(!getEmail){
            return res.status(200).json({
                message: "User not Found"
            })
        }

        return res.status(200).json({
            message: "Profile",
            data: { getEmail }
        })
    } catch (error) {
        res.json({
            error: error,
            message: "Internal Server Error"
        })
    }

}

module.exports = {
    getProfile
}