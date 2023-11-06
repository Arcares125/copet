const {Dokter,PenyediaJasa, sequelize, Review} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const createReview = async (req, res) => {

    const data = req.body

    try {

        const dataReview = await Review.create(data)
        return res.status(201).json({
            message: "Review Berhasil Disimpan",
            kode: 201,
            data: dataReview
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    createReview
}