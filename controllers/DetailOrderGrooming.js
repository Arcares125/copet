const {Dokter,PenyediaJasa, sequelize, DetailOrderGrooming} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const createDetailOrderGrooming = async (req, res) => {

    const data = req.body

    try {
        const dataDetailOrderGrooming = await DetailOrderGrooming.create(data)
        return res.status(201).json({
            response_code: 201,
            message: "Data Detail Order Grooming Berhasil Disimpan",
            data: dataDetailOrderGrooming
        })
      

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

module.exports = {
    createDetailOrderGrooming
}