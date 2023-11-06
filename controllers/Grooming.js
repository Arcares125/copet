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


    const dataGrooming = await Grooming.create(data)
            return res.status(201).json({
                message: "Data Grooming Berhasil Disimpan",
                kode: 201,
                data: dataGrooming
            })
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
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
            message: "Data Grooming berhasil diambil",
            kode: 200,
            data: dataGrooming[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    registerGrooming,
}