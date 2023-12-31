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
            response_code: 200,
            message: "Profile",
            data: { getEmail }
        })
    } catch (error) {
        res.status(500).json({
            response_code: 500,
            error: error.message,
            message: "Internal Server Error"
        })
    }

}

//change pass - update profile

//need tabel tipejasa

module.exports = {
    getProfile
}