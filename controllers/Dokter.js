const {Dokter,PenyediaJasa, sequelize, DetailOrderDokter, Order, Review} = require("../models")
const { Op } = require('sequelize');
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
        
        if(checkRoleTokoPenyediaJasa[0].jenis_jasa === null){

            await PenyediaJasa.update({
                jenis_jasa: 'Dokter'
            }, 
            {
                where:{
                    id: data.penyedia_id
                }
            })

            const dataDokter = await Dokter.create(data)
            return res.status(201).json({
                message: "Data Dokter Berhasil Disimpan",
                response_code: 201,
                data: dataDokter
            })
        } else if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
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

    let dataDokter
    let value = req.params
    let mergeData = []

    if(!value.dokterId && req.query.nama_dokter){   
        dataDokter = await Dokter.findAll({
            where:{
                nama: {
                    [Op.substring]: req.query.nama_dokter
                }
            }
        })

        for(let i = 0; i < dataDokter.length; i++){

            let dataDetail = await DetailOrderDokter.findAll({
                where:{
                    dokter_id: dataDokter[i].dataValues.id
                }
            })
        
           if(dataDetail.length > 0){
                let dataOrder = await Order.findOne({
                    where: {
                        id: dataDetail[i].dataValues.order_id
                    }
                })
        
                let reviewData = await Review.findAll({
                    where: {
                        dokter_id: dataDokter[i].dataValues.id,
                        customer_id: dataOrder[i].dataValues.user_id
                    }
                })
                let sum = 0;
                for(let j = 0; j < reviewData.length; j++){
                    sum += reviewData[j].dataValues.rating;
                }
                let averageReview = sum / reviewData.length;
                mergeData.push({rating: averageReview, total_rating: reviewData.length, ...dataDokter[i].dataValues})
            } else {
                mergeData.push({ rating: 0, total_rating: 0, ...dataDokter[i].dataValues})
            }
        }
    } else {
        dataDokter = await Dokter.findAll()
    
        for(let i = 0; i < dataDokter.length; i++){

            let dataDetail = await DetailOrderDokter.findAll({
                where:{
                    dokter_id: dataDokter[i].dataValues.id
                }
            })
        
           if(dataDetail.length > 0){
                let dataOrder = await Order.findOne({
                    where: {
                        id: dataDetail[i].dataValues.order_id
                    }
                })
        
                let reviewData = await Review.findAll({
                    where: {
                        dokter_id: dataDokter[i].dataValues.id,
                        customer_id: dataOrder[i].dataValues.user_id
                    }
                })
                let sum = 0;
                for(let j = 0; j < reviewData.length; j++){
                    sum += reviewData[j].dataValues.rating;
                }
                let averageReview = sum / reviewData.length;
                mergeData.push({rating: averageReview, total_rating: reviewData.length, ...dataDokter[i].dataValues})
            } else {
                mergeData.push({ rating: 0, total_rating: 0, ...dataDokter[i].dataValues})
            }
        }
    }

    try {
        let tempDataDokter = []
        for(let i = 0; i < mergeData.length; i++){
            if(mergeData[i].is_acc){
                tempDataDokter.push(mergeData[i])
            }else {
                continue
            }
        }
        return res.status(200).json({
            response_code: 200,
            message: "Data Dokter berhasil diambil",
            data: tempDataDokter
        })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDataDokterAvailable = async (req, res) => {

    let dataDokter

    try {

        dataDokter = await Dokter.findAll({
            where:{
                is_available: true
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Data Dokter berhasil diambil",
            data: dataDokter
        })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDataDokterDetail = async (req, res) => {

    let dataDokter
    let value = req.params

    try {
        dataDokter = await Dokter.findOne({
            where:{
                id: value.dokterId
            }
        })
    
        let dataDetail = await DetailOrderDokter.findOne({
            where:{
                dokter_id: dataDokter.dataValues.id
            }
        })
    
       if(dataDetail){
            let dataOrder = await Order.findOne({
                where: {
                    id: dataDetail.dataValues.order_id
                }
            })
    
            let reviewData = await Review.findAll({
                where: {
                    dokter_id: dataDokter.dataValues.id,
                    customer_id: dataOrder.dataValues.user_id
                }
            })
            let sum = 0;
            for(let i = 0; i < reviewData.length; i++){
                sum += reviewData[i].dataValues.rating;
            }
            let averageReview = sum / reviewData.length;

            return res.status(200).json({
                response_code: 200,
                message: "Data Dokter berhasil diambil",
                data: {...dataDokter.dataValues, rating: averageReview, total_rating: reviewData.length}
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Dokter berhasil diambil",
                data: {...dataDokter.dataValues, rating: 0, total_rating: 0}
            })
        }
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

const deleteDokter = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        const getDokterData = await Dokter.findOne({
            where: {
                id: value.DokterId
            }
        })

        await Dokter.destroy({
            where:{
                id: value.dokterId
            }
        })

        await PenyediaJasa.update({
            jenis_jasa: null
        }, {
            where: {
                id: getDokterData.penyedia_id
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Dokter has been deleted!",
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

const updateAvailable = async (req, res) => {

    const value = req.params

    try {

        const currDokter = await Dokter.findOne({
            where: {
                id: value.dokterId
            }
        })

        if(!currDokter){
            return res.status(404).json({
                response_code: 404,
                message: "Dokter not found"
            })
        }

        if(currDokter.dataValues.is_available){
            await Dokter.update({
                is_available: false
            },{
                where: {
                    id: value.dokterId
                }
            })
    
            return res.status(200).json({
                response_code: 200,
                message: "Dokter is Now Not Available"
            })
        } else {
            await Dokter.update({
                is_available: true
            },{
                where: {
                    id: value.dokterId
                }
            })
    
            return res.status(200).json({
                response_code: 200,
                message: "Dokter is Now Available"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error: "+error.message
        })
    }
}

module.exports = {
    registerDokter,
    getDataDokter,
    getDataDokterAvailable,
    updateDokter,
    deleteDokter,
    confirmOrder,
    getDataDokterDetail,
    updateAvailable
}