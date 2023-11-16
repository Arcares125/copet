const {Toko, PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const registerToko = async (req, res) => {

    try {
        const data = req.body
    const currJenisJasa = 'Toko' || 'toko'
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
        console.log(getPenyediaJasaID[0].dataValues.id)
        if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                message: "Penyedia Jasa hanya dapat mendaftarkan 1 jenis jasa / usaha",
                kode: 404,
                data: ''
            })
        } else {
            const dataToko = await Toko.create(data)
            return res.status(201).json({
                message: "Data Toko Berhasil Disimpan",
                kode: 201,
                data: dataToko
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const getDataToko = async (req, res) => {

    const dataToko = await sequelize.query(
        `
        SELECT * FROM toko
        `
    )

    try {
        return res.status(200).json({
            message: "Data Toko berhasil diambil",
            kode: 200,
            data: dataToko[0]
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const getDetailCardToko = async (req, res) => {

    const cekServisGrooming = await sequelize.query(
        `
        select count(a.id) from toko a JOIN grooming b
        ON a.id = b.toko_id
        `
    )

    const cekServisHotel = await sequelize.query(
        `
        select count(a.id) from toko a JOIN hotel b
        ON a.id = b.toko_id
        `
    )

    let query;

    try {
        query = `
        SELECT a.id, a.nama as pet_shop_name,z.rating, z.total_rating,
        CASE
            WHEN count(b.id) > 0 AND count(c.id) > 0 THEN 'Grooming, Hotel'
            WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN 'Hotel'
            ELSE 'Grooming'
        END AS services
        from (select CAST(AVG(a.rating) AS DECIMAL(10,2)) AS rating,
            COUNT(a.id) as total_rating
            from review a join "order" b ON a.order_id = b.id ) z,
        toko a LEFT JOIN hotel b
        ON a.id = b.toko_id 
        LEFT JOIN grooming c ON a.id = c.toko_id
        GROUP BY a.id, a.nama, a.foto,z.rating, z.total_rating
        `
        const detail = await sequelize.query(query, 
            { type: QueryTypes.SELECT }
        )
        return res.status(200).json({
            message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
            kode: 200,
            data: detail[0]
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    registerToko,
    getDataToko,
    getDetailCardToko
}