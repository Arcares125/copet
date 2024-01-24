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
        
        if(checkRoleTokoPenyediaJasa[0].jenis_jasa === null){

            await PenyediaJasa.update({
                jenis_jasa: 'Trainer'
            }, 
            {
                where:{
                    id: data.penyedia_id
                }
            })

            const dataTrainer = await Trainer.create(data)
            return res.status(201).json({
                message: "Data Trainer Berhasil Disimpan",
                response_code: 201,
                data: dataTrainer
            })
        } else if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                response_code: 404,
                message: "Penyedia Jasa hanya dapat memiliki 1 jenis jasa / usaha",
                data: ''
            })
        } else {
            const dataTrainer = await Trainer.create(data)
            return res.status(201).json({
                response_code: 201,
                message: "Data Trainer Berhasil Disimpan",
                data: dataTrainer
            })
        }

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDataTrainer = async (req, res) => {

    let dataTrainer
    let value = req.params

    if(!value.trainerId && req.query.nama_trainer){   
        dataTrainer = await Trainer.findAll({
            where:{
                nama: {
                    [Op.substring]: req.query.nama_trainer
                }
            }
        })
    } else {
        dataTrainer = await Trainer.findAll()
    }

    try {
        return res.status(200).json({
            response_code: 200,
            message: "Data Trainer berhasil diambil",
            data: dataTrainer
        })
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const updateTrainer = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await Trainer.update({
            nama: data.nama,
            spesialis: data.spesialis,
            pengalaman: data.pengalaman,
            harga: data.harga,
            lokasi: data.lokasi
        }, {
            where:{
                id: value.trainerId
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

const deleteTrainer = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        const getTrainerData = await Trainer.findOne({
            where: {
                id: value.TrainerId
            }
        })

        await Trainer.destroy({
            where:{
                id: value.trainerId
            }
        })

        await PenyediaJasa.update({
            jenis_jasa: null
        }, {
            where: {
                id: getTrainerData.penyedia_id
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Trainer has been deleted!",
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

const confirmOrder = async (req, res) => {

    const value = req.params
    // tokoId/orderId
    try {
        
        await Order.update({
            status_order: 'On Progress',
            where:{
                order_id: value.orderId
            },
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
    registerTrainer,
    getDataTrainer,
    updateTrainer,
    deleteTrainer,
    confirmOrder
}