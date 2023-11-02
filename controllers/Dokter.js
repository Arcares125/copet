const {Dokter,PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerDokter = async (req, res) => {

    const data = req.body
    const currJenisJasa = 'Dokter' || 'dokter'
    const getPenyediaJasaID = await PenyediaJasa.findAll({
        attributes: ['id'],
        where: {
            id: data.penyedia_id
        }
    })
    console.log(getPenyediaJasaID)
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
            replacements: { id: getPenyediaJasaID[0]?.dataValues?.id },
            type: QueryTypes.SELECT
        }
    )

    try {

        if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                message: "Penyedia Jasa hanya dapat memiliki 1 jenis jasa / usaha",
                kode: 404,
                data: ''
            })
        } else {
            const dataDokter = await Dokter.create(data)
            return res.status(201).json({
                message: "Data Dokter Berhasil Disimpan",
                kode: 201,
                data: dataDokter
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const getDataDokter = async (req, res) => {

    const dataDokter = await sequelize.query(
        `
        SELECT * FROM dokter
        `
    )

    try {
        return res.status(200).json({
            message: "Data Dokter berhasil diambil",
            kode: 200,
            data: dataDokter[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    registerDokter,
    getDataDokter
}