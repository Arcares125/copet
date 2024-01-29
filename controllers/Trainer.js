const {Trainer, PenyediaJasa, sequelize, DetailOrderTrainer, Order, Review, User} = require("../models")
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
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
    let mergeData = []

    if(!value.trainerId && req.query.nama_trainer){   
        dataTrainer = await Trainer.findAll({
            where:{
                nama: {
                    [Op.substring]: req.query.nama_trainer
                }
            }
        })

        for(let i = 0; i < dataTrainer.length; i++){

            let dataDetail = await DetailOrderTrainer.findAll({
                where:{
                    trainer_id: dataTrainer[i].dataValues.id
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
                        trainer_id: dataTrainer[i].dataValues.id,
                        customer_id: dataOrder[i].dataValues.user_id
                    }
                })
                let sum = 0;
                for(let j = 0; j < reviewData.length; j++){
                    sum += reviewData[j].dataValues.rating;
                }
                let averageReview = sum / reviewData.length;
                mergeData.push({rating: averageReview.toFixed(1), total_rating: reviewData.length, ...dataTrainer[i].dataValues})
            } else {
                mergeData.push({rating: 0, total_rating: 0, ...dataTrainer[i].dataValues})
            }
        }
    } else {
        dataTrainer = await Trainer.findAll()

        for(let i = 0; i < dataTrainer.length; i++){

            let dataDetail = await DetailOrderTrainer.findAll({
                where:{
                    trainer_id: dataTrainer[i].dataValues.id
                }
            })
        
           if(dataDetail.length > 0){
                let dataOrder = await Order.findAll({
                    where: {
                        id: dataDetail[i].dataValues.order_id
                    }
                })
        
                let reviewData = await Review.findAll({
                    where: {
                        trainer_id: dataTrainer[i].dataValues.id,
                        customer_id: dataOrder[i].dataValues.user_id
                    }
                })
                let sum = 0;
                for(let j = 0; j < reviewData.length; j++){
                    sum += reviewData[j].dataValues.rating;
                }
                let averageReview = sum / reviewData.length;
                mergeData.push({rating: averageReview.toFixed(1), total_rating: reviewData.length, ...dataTrainer[i].dataValues})
            } else {
                mergeData.push({rating: 0, total_rating: 0, ...dataTrainer[i].dataValues})
            }
        }
    }

    try {
        let tempDataTrainer = []
        for(let i = 0; i < mergeData.length; i++){
            if(mergeData[i].is_acc){
                tempDataTrainer.push(mergeData[i])
            } else {
                continue
            }
        }
        return res.status(200).json({
            response_code: 200,
            message: "Data Trainer berhasil diambil",
            data: tempDataTrainer
        })
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDataTrainerAvailable = async (req, res) => {

    let dataTrainer

    try {

        dataTrainer = await Trainer.findAll({
            where:{
                is_available: true
            }
        })

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

const getDataTrainerDetail = async (req, res) => {

    let dataTrainer
    let value = req.params
    let ulasan = []
    let counter = 0
    let averageRev = 0.0.toFixed(1);
    let allReview = []

    try {
        dataTrainer = await Trainer.findOne({
            where:{
                id: value.trainerId
            }
        })
    
        let dataDetail = await DetailOrderTrainer.findAll({
            where:{
                trainer_id: dataTrainer.dataValues.id
            }
        })
    
       if(dataDetail){
            for(let j = 0; j < dataDetail.length; j++){
                let dataOrder = await Order.findOne({
                    where: {
                        id: dataDetail[j].dataValues.order_id
                    }
                })

                let userData = await User.findOne({
                    where: {
                        id: dataOrder.dataValues.user_id
                    }
                })
        
                let reviewData = await Review.findAll({
                    where: {
                        trainer_id: dataTrainer.dataValues.id,
                        customer_id: dataOrder.dataValues.user_id
                    }
                })
                let sum = 0;
                if(counter === reviewData.length){
                    //do nothing
                } else {
                    for(let i = 0; i < reviewData.length; i++){
                        sum += reviewData[i].dataValues.rating;
                        ulasan.push(reviewData[i].dataValues.ulasan)
                        counter++;
                        allReview.push({ nama_user: userData.dataValues.nama, rate: reviewData[i].dataValues.rating.toFixed(1), review_description: reviewData[i].dataValues.ulasan})
                    }
                    // let averageReview = sum / reviewData.length;
                    // averageRev = parseFloat(averageReview).toFixed(1);
                    // total_rate = reviewData.length
                }
            }

            return res.status(200).json({
                response_code: 200,
                message: "Data Trainer berhasil diambil",
                data: {...dataTrainer.dataValues, review: allReview}
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Trainer berhasil diambil",
                data: {...dataTrainer.dataValues, rating: averageRev, total_rating: 0}
            })
        }
    } catch (error) {
        console.log(error)
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

const updateAvailable = async (req, res) => {

    const value = req.params

    try {

        const currTrainer = await Trainer.findOne({
            where: {
                id: value.trainerId
            }
        })

        if(!currTrainer){
            return res.status(404).json({
                response_code: 404,
                message: "Trainer not found"
            })
        }

        if(currTrainer.dataValues.is_available){
            await Trainer.update({
                is_available: false
            },{
                where: {
                    id: value.trainerId
                }
            })
    
            return res.status(200).json({
                response_code: 200,
                message: "Trainer is Now Not Available"
            })
        } else {
            await Trainer.update({
                is_available: true
            },{
                where: {
                    id: value.trainerId
                }
            })
    
            return res.status(200).json({
                response_code: 200,
                message: "Trainer is Now Available"
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
    registerTrainer,
    getDataTrainer,
    getDataTrainerAvailable,
    updateTrainer,
    deleteTrainer,
    confirmOrder,
    getDataTrainerDetail,
    updateAvailable
}