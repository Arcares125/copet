const {User, PenyediaJasa, Chat, sequelize, Sequelize, Toko} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


const getOnProgressChat = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    try {

        const getChatOnProgress = await Chat.findAll({
            where: {
                status: {
                    [Op.iLike]: '%On Progress%'
                }
            }
        })

        if(getChatOnProgress)

        res.status(200).json({
            response_code: 200,
            message: "Register Success",
            data: getChatOnProgress
        })    
    } catch (error) {
        res.status(500).json({
            response_code: 500,
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

module.exports = {
    getOnProgressChat
}