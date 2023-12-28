const {Trainer, PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerTrainer = async (req, res) => {

    const data = req.body
    const currJenisJasa = 'Trainer' || 'trainer'
    const getPenyediaJasaID = await PenyediaJasa.findAll({
        attributes: ['id'],
        where: {
            id: data.penyedia_id
        }
    })
    const checkRoleTokoPenyediaJasa = await sequelize.query(
        `
        SELECT jenis_jasa FROM penyedia_jasa WHERE id = :id
        `,
        {
            replacements: { id: data.penyedia_id },
            type: QueryTypes.SELECT
        }
    )
    const getTokoTaken = await sequelize.query(
        `
        SELECT * FROM toko WHERE penyedia_id = :id
        `,
        {
            replacements: { id: getPenyediaJasaID[0].dataValues.id },
            type: QueryTypes.SELECT
        }
    )
    const getDokterTaken = await sequelize.query(
        `
        SELECT * FROM dokter WHERE penyedia_id = :id
        `,
        {
            replacements: { id: getPenyediaJasaID[0].dataValues.id },
            type: QueryTypes.SELECT
        }
    )
    const getTrainerTaken = await sequelize.query(
        `
        SELECT * FROM trainer WHERE penyedia_id = :id
        `,
        {
            replacements: { id: getPenyediaJasaID[0].dataValues.id },
            type: QueryTypes.SELECT
        }
    )

    try {

        if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                message: "Penyedia Jasa hanya dapat mendaftarkan 1 jenis jasa / usaha",
                response_code: 404,
                data: ''
            })
        } else {
            const dataTrainer = await Trainer.create(data)
            return res.status(201).json({
                message: "Data Trainer Berhasil Disimpan",
                response_code: 201,
                data: dataTrainer
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDataTrainer = async (req, res) => {

    const dataTrainer = await sequelize.query(
        `
        SELECT * FROM trainer
        `
    )

    try {
        return res.status(200).json({
            message: "Data Trainer berhasil diambil",
            response_code: 200,
            data: dataTrainer[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

module.exports = {
    registerTrainer,
    getDataTrainer
}