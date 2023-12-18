const {
    PetActivity,
} = require("../models")
    const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


const createActivity = async (req, res) => {

    const data = req.body
    const currentDate = new Date();

    try {

        const dataActivity = await PetActivity.create({
            nama: data.nama,
            tanggal_aktivitas: data.tanggal_aktivitas
        })  

        


    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}


module.exports = {
    createActivity,

}