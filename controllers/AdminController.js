const {User, PenyediaJasa, Admin, sequelize, Sequelize, Toko, Dokter, Trainer} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const confirmRegisterToko = async (req, res) =>{
    const value = req.params
    
    try {
        const getDataToko = await Toko.findOne({
            where: {
                id: value.tokoId
            },
            logging: true
        })

        if(!getDataToko) {
            return res.status(404).json({
                response_code: "404",
                message: "Toko not found"
            })
        } else {
            await Toko.update({
                is_acc: "true"
            }, 
            { 
                where: {
                    id: value.tokoId
                } 
            })
        }

        res.status(200).json({
            response_code: "200",
            message: "Toko Registration Accepted"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            message: "Internal server error"
        })
    }
}

const confirmRegisterDokter = async (req, res) =>{
    const value = req.params
    
    try {
        const getDataDokter = await Dokter.findOne({
            where: {
                id: value.dokterId
            },
            logging: true
        })

        if(!getDataDokter) {
            return res.status(404).json({
                response_code: "404",
                message: "Dokter not found"
            })
        } else {
            await Dokter.update({
                is_acc: "true"
            }, 
            { 
                where: {
                    id: value.dokterId
                } 
            })
        }

        res.status(200).json({
            response_code: "200",
            message: "Dokter Registration Accepted"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            message: "Internal server error"
        })
    }
}

const confirmRegisterTrainer = async (req, res) =>{
    const value = req.params
    
    try {
        const getDataTrainer = await Trainer.findOne({
            where: {
                id: value.trainerId
            },
            logging: true
        })

        if(!getDataTrainer) {
            return res.status(404).json({
                response_code: "404",
                message: "Trainer not found"
            })
        } else {
            await Trainer.update({
                is_acc: "true"
            }, 
            { 
                where: {
                    id: value.trainerId
                } 
            })
        }

        res.status(200).json({
            response_code: "200",
            message: "Trainer Registration Accepted"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            message: "Internal server error"
        })
    }
}

const getAllDataToko = async (req, res) =>{

    try {
        
        const dataToko = await Toko.findAll()

        if(dataToko.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Toko Kosong!"
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Toko ditemukan.",
                data: dataToko
            })
        }
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error",
            error_message: error.message
        })
    }
}

const getAllDataTrainer = async (req, res) =>{

    try {
        
        const dataTrainer = await Trainer.findAll()

        if(dataTrainer.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Trainer Kosong!"
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Trainer ditemukan.",
                data: dataTrainer
            })
        }
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error",
            error_message: error.message
        })
    }
}

const getAllDataDokter = async (req, res) =>{

    try {
        
        const dataDokter = await Dokter.findAll()

        if(dataDokter.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Dokter Kosong!"
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Dokter ditemukan.",
                data: dataDokter
            })
        }
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error",
            error_message: error.message
        })
    }
}

const getAllDataPenyediaJasa = async (req, res) =>{

    try {
        
        const dataPenyediaJasa = await PenyediaJasa.findAll()

        if(dataPenyediaJasa.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa Kosong!"
            })
        } else {
            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa ditemukan.",
                data: dataPenyediaJasa
            })
        }
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error",
            error_message: error.message
        })
    }
}
module.exports = {
    confirmRegisterToko,
    confirmRegisterDokter,
    confirmRegisterTrainer,
    getAllDataToko,
    getAllDataDokter,
    getAllDataTrainer,
    getAllDataPenyediaJasa
}