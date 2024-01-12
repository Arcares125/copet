// const { Sequelize } = require('sequelize');
const {User, Order} = require("../models")
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

//update profile

const updateUser = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {
        const passHash = await bcrypt.hash(data.password, saltRounds);
        await User.update({
            nama: data.nama,
            email: data.email,
            no_telp: data.no_telp,
            gender: data.gender,
            password: passHash
        }, {
            where:{
                id: value.userId
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Data has been updated!",
            data: {...data, password: passHash}
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

const deleteUser = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await User.destroy({
            where:{
                id: value.userId
            }
        })

        await Order.destroy({
            where: {
                user_id: value.userId
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "User Data has been deleted!",
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

//need tabel tipejasa

module.exports = {
    getProfile,
    updateUser,
    deleteUser
}