const {Dokter,PenyediaJasa, sequelize, Order} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const createOrder = async (req, res) => {

    const data = req.body

    try {

        const dataOrder = await Order.create(data)
        return res.status(201).json({
            message: "Data Order Berhasil Disimpan",
            kode: 201,
            data: dataOrder
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    createOrder
}