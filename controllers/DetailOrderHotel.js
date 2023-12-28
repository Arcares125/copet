const {Dokter,PenyediaJasa, sequelize, DetailOrderHotel} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const createDetailOrderHotel = async (req, res) => {

    const data = req.body

    try {
        const dataDetailOrderHotel = await DetailOrderHotel.create(data)
        return res.status(201).json({
            response_code: 201,
            message: "Data Detail Order Hotel Berhasil Disimpan",
            data: dataDetailOrderHotel
        })
      

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

module.exports = {
    createDetailOrderHotel
}