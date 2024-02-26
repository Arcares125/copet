const {PenyediaJasa, Order} = require("../models")
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

const updatePenyediaJasa = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {
        if(data.nama === "Admin Kenth" || data.email === "copetcs@gmail.com"){
            return res.status(200).json({
                response_code: 200
            })
        } else {
            await PenyediaJasa.update({
                nama: data.nama,
                email: data.email,
                no_telp: data.no_telp,
                gender: data.gender,
                // jenis_jasa: data.jenis_jasa,
                // password: passHash
            }, {
                where:{
                    id: value.penyediaId
                }
            })
    
            return res.status(200).json({
                response_code: 200,
                message: "Data has been updated!",
                data: data
            })
        }
        // const passHash = await bcrypt.hash(data.password, saltRounds);

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

const deletePenyediaJasa = async (req, res) =>{

    const value = req.params

    try {

        await PenyediaJasa.destroy({
            where:{
                id: value.penyediaId
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Data Penyedia Jasa has been deleted!",
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

const confirmOrder = async (req, res) => {

    const value = req.params
    // tokoId/orderId
    try {

        const checkPenyedia = await PenyediaJasa.findOne({
            where:{
                id: value.penyediaId
                // /confirm-order/:penyediaId/:orderId
            }
        })

        if(!checkPenyedia){
            return res.status(404).json({
                response_code: 404,
                message: "Penyedia Jasa not found"
            })
        }
        
        await Order.update(
            {
                status_order: 'On Progress'
            },
            {
                where:{ id: value.orderId }
            }
        )

        return res.status(200).json({
            response_code: 200,
            message: `Order ID: ${value.orderId} has been Confirmed by Penyedia Jasa: ${checkPenyedia.dataValues.nama}`
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

module.exports = {
    registerPenyediaJasa,
    updatePenyediaJasa,
    deletePenyediaJasa,
    confirmOrder
}