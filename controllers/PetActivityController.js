const {
    PetActivity, HewanPeliharaan, User, sequelize
} = require("../models")
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


const createActivity = async (req, res) => {

    const data = req.body
    const currentDate = new Date();

    try {

        const isHewanValid = await HewanPeliharaan.findOne({
            where : {
                id: data.hewan_id
            }
        })

        if(!isHewanValid){
            return res.status(404).json({
                response_code: 404,
                message: "Hewan peliharaan tidak ditemukan"
            })
        }

        const dataActivity = await PetActivity.create({
            nama: data.nama,
            hewan_id: data.hewan_id,
            tanggal_aktivitas: data.tanggal_aktivitas,
            mulai_aktivitas: data.mulai_aktivitas,
            akhir_aktivitas: data.akhir_aktivitas,
            // isAllDay: data.isAllDay ?,
            // background: ,
            // description: 
        })      

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}


module.exports = {
    createActivity,

}