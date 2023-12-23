const {PenyediaJasa} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerPenyediaJasa = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    const data = req.body
    try {
        const passHash = await bcrypt.hash(data.password, saltRounds);


        const isEmailValid = await PenyediaJasa.findOne({
            where:{
                email: data.email
            }
        })

        if(isEmailValid){
            res.status(200).json({
                message: "Email sudah digunakan",
            })    
        } else {
            const result = await PenyediaJasa.create({...data, password: passHash})
            res.status(200).json({
                message: "Register Success",
                data: result
            })    
        }
    } catch (error) {
        res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

module.exports = {
    registerPenyediaJasa
}