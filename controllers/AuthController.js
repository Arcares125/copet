const {User, PenyediaJasa , sequelize, Sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const loginUser = async (req, res) =>{
    // const email = req.body.email
    // const password = req
    const { email, password } = req.body
    
    try {
        const getEmail = await User.findOne({
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

const registerUser = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    const data = req.body
    try {

        const checkEmail = await User.findOne({
            where: {
                email: data.email
            },
            logging: true
        })

        if(checkEmail){
            return res.status(200).json({
                code: 200,
                message: "Email already registered",
            })    
        }

        // if(data.email === "" || data.email === null){
        //     return res.status(200).json({
        //         code: 200,
        //         message: "Email cannot be empty",
        //     })  
        // }

        const passHash = await bcrypt.hash(data.password, saltRounds);
        const result = await User.create({...data, password: passHash})

        res.status(200).json({
            code:200,
            message: "Register Success",
            data: result
        })    
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const logout = async (req, res) => {

    const { email } = req.body

    const getData = User.findOne({
        where: {
            email:email
        }
    })

    await User.update({ refreshToken: null },
        { where: 
            { email: email }
        }
    )
}

const getToken = async (req, res) => {

    try {
        const { email, password } = req.body
    
        const user = {
            email: email,
            password: password
        }
    
        const token = jwt.sign(user, TOKEN_LOGIN, {expiresIn: '5m'})
        return res.status(200).json({
            token: token
        })
    } catch (error) {
        return res.status(400).json({
            err: error
        })
    }
}

// Penyedia Jasa
const loginPenyediaJasa = async (req, res) =>{
    const { email, password } = req.body
    
    try {
        const getEmail = await PenyediaJasa.findOne({
            where: {
                email: email
            },
            logging: false
        })

        if(!getEmail) return res.status(404).json({
            message: "Wrong email / password"
        })
        
        const comparePass = await bcrypt.compare(password, getEmail.password)
        if(!comparePass) return res.status(404).json({
            message: "Wrong email / password"
        })

        const penyediaJasa = {
            id: getEmail.id,
            email: getEmail.email,
        }

        const tokenLogin = jwt.sign(penyediaJasa, TOKEN_LOGIN, { expiresIn: '5m' })
        const refreshToken = jwt.sign(penyediaJasa, TOKEN_REFRESH, { expiresIn: '7d' })

        await PenyediaJasa.update({ refreshToken: refreshToken },
            { where: { email: penyediaJasa.email} }
        )

        res.status(200).json({
            code: 200,
            message: "Login Success",
            data: penyediaJasa,
            token: tokenLogin,
            refreshToken: refreshToken
        })
    } catch (error) {
        res.json({
            error: error,
            message: "Invalid Email/Password"
        })
    }

}

module.exports = {
    loginUser,
    registerUser,
    loginPenyediaJasa,
    logout,
    getToken
}