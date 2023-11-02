const {PenyediaJasa} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

        // Penyedia Jasa

const registerPenyediaJasa = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    const data = req.body
    try {
        const passHash = await bcrypt.hash(data.password, saltRounds);
        const result = await PenyediaJasa.create({...data, password: passHash})
        console.log(data)

        res.status(200).json({
            message: "Register Success",
            data: result
        })    
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    registerPenyediaJasa
}