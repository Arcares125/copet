const {User} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const loginUser = async (req, res) =>{

    const { email, password } = req.body
    try {
        const getEmail = await User.findOne({
            where: {
                email: email
            }
        })
        // console.log(getEmail)

        if(!getEmail) return res.status(404).json({
            message: "Wrong email / password"
        })
        
        const comparePass = await bcrypt.compare(password, getEmail.password)
        if(!comparePass) return res.status(404).json({
            message: "Wrong email / password"
        })

        const user = {
            id: getEmail.id,
            email: getEmail.email,
        }

        const tokenLogin = jwt.sign(user, TOKEN_LOGIN, { expiresIn: '1d' })
        const refreshToken = jwt.sign(user, TOKEN_REFRESH, { expiresIn: '3d' })

        res.status(200).json({
            message: "Login Success",
            data: user,
            token: tokenLogin,
            refreshToken: refreshToken
        })
    } catch (error) {
        res.json({
            message: "GA MASOK"
        })
    }

}

const registerUser = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    const data = req.body
    try {
        const passHash = await bcrypt.hash(data.password, saltRounds);
        const result = await User.create({...data, password: passHash})

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

// module.exports = {
//     loginUser,
//     registerUser
// }