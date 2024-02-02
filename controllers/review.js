const {Dokter,PenyediaJasa, sequelize, Review} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const createReview = async (req, res) => {

    const data = req.body
    let dataReview;
    try {

        if(data.toko_id){
            dataReview = await Review.create({
                ...data,
                toko_id: data.toko_id
            })
        } else if(data.dokter_id){
            dataReview = await Review.create({
                ...data,
                dokter_id: data.dokter_id
            })
        } else if(data.trainer_id){
            dataReview = await Review.create({
                ...data,
                trainer_id: data.trainer_id
            })
        } else {
            return res.status(200).json({
                message: "Data Belum Lengkap!",
                response_code: 200,
            })
        }


        return res.status(201).json({
            message: "Review Berhasil Disimpan",
            response_code: 201,
            data: dataReview
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

module.exports = {
    createReview
}