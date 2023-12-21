const {User, PenyediaJasa, Admin, sequelize, Sequelize} = require("../models")
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

module.exports = {
    confirmRegisterToko,
    confirmRegisterDokter,
    confirmRegisterTrainer
}