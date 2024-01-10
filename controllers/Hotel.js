const {Toko, PenyediaJasa, sequelize, Hotel} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerHotel = async (req, res) => {

    try {
        const data = req.body

        const getDataToko = await Toko.findOne({
            where:{
                id: data.toko_id
            }
        })

        if(getDataToko.dataValues.is_acc === false){
            return res.status(200).json({
                response_code: 200,
                message: "Toko belum disetujui oleh Admin.",
            })
        }

        const dataHotel = await Hotel.create(data)
        return res.status(201).json({
            response_code: 201,
            message: "Data Hotel Berhasil Disimpan",
            data: dataHotel
        })
        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const getDataHotel = async (req, res) => {

    const dataToko = await sequelize.query(
        `
        SELECT * FROM toko
        `
    )

    try {
        return res.status(200).json({
            response_code: 200,
            message: "Data Toko berhasil diambil",
            data: dataToko[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const updateHotel = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await Hotel.update({
            tipe_hotel: data.tipe_hotel,
            fasilitas: data.fasilitas,
            harga: data.harga,
        }, {
            where:{
                id: value.hotelId
            }
        })

        return res.status(200).message({
            response_code: 200,
            message: "Data has been updated!",
            data: data
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).message({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

module.exports = {
    registerHotel,
    getDataHotel,
    updateHotel
}