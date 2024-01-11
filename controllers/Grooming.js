const {Toko, PenyediaJasa, sequelize, Grooming} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerGrooming = async (req, res) => {

    try {
        const data = req.body

        const getDataToko = await Toko.findOne({
            include: {
                model: PenyediaJasa,
                as: 'role_toko',
                required: true,
                attributes: ['id'],
            },
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

        const dataGrooming = await Grooming.create(data)

            return res.status(201).json({
                response_code: 201,
                message: "Data Grooming Berhasil Disimpan",
                data: {...dataGrooming.dataValues, penyedia_id: getDataToko.dataValues.role_toko.dataValues.id}
            })
        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDataGrooming = async (req, res) => {

    const dataGrooming = await sequelize.query(
        `
        SELECT * FROM grooming
        `
    )

    try {
        return res.status(200).json({
            response_code: 200,
            message: "Data Grooming berhasil diambil",
            data: dataGrooming[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const updateGrooming = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await Grooming.update({
            tipe: data.tipe,
            fasilitas: data.fasilitas,
            harga: data.harga,
        }, {
            where:{
                id: value.groomingId
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Data has been updated!",
            data: data
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
    registerGrooming,
    updateGrooming
}