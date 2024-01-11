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


    try {

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
                replacements: { id: getPenyediaJasaID[0]?.dataValues?.id },
                type: QueryTypes.SELECT
            }
        )
        
        if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                response_code: 404,
                message: "Penyedia Jasa hanya dapat memiliki 1 jenis jasa / usaha",
                data: ''
            })
        } else {
            const dataDokter = await Dokter.create(data)
            return res.status(201).json({
                response_code: 201,
                message: "Data Dokter Berhasil Disimpan",
                data: dataDokter
            })
        }

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
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
            response_code: 200,
            message: "Data Dokter berhasil diambil",
            data: dataDokter[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const updateDokter = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await Dokter.update({
            nama: data.nama,
            spesialis: data.spesialis,
            pengalaman: data.pengalaman,
            harga: data.harga,
            alumni: data.alumni,
            lokasi_praktek: data.lokasi_praktek,
            no_str: data.no_str
        }, {
            where:{
                id: value.dokterId
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Data has been updated!",
            data: data
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

module.exports = {
    registerDokter,
    getDataDokter,
    updateDokter
}