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
            message: error.message,
            kode: 500,
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
            message: "Data Toko berhasil diambil",
            kode: 200,
            data: dataToko[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    registerHotel,
    getDataHotel
}