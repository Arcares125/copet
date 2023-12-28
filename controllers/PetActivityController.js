const {
    PetActivity, HewanPeliharaan, User, sequelize
} = require("../models")
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


const createActivity = async (req, res) => {

    const data = req.body
    const currentDate = new Date();

    try {

        const isHewanValid = await HewanPeliharaan.findOne({
            where : {
                id: data.hewan_id
            }
        })

        if(!isHewanValid){
            return res.status(404).json({
                response_code: 404,
                message: "Hewan peliharaan tidak ditemukan"
            })
        }

        const dataActivity = await PetActivity.create(data)    
        return res.status(201).json({
            response_code: 201,
            message: "Schedule Pet Activity successfully created.",
            data: dataActivity
        })

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const updateActivity = async (req, res) => {

    const data = req.body
    const currentDate = new Date();

    try {

        const isHewanValid = await HewanPeliharaan.findOne({
            where : {
                id: data.hewan_id
            }
        })

        if(!isHewanValid){
            return res.status(404).json({
                response_code: 404,
                message: "Hewan peliharaan tidak ditemukan"
            })
        }

        const dataActivity = await PetActivity.create(data)    
        return res.status(201).json({
            response_code: 201,
            message: "Schedule Pet Activity successfully created.",
            data: dataActivity
        })

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getListActivity = async (req, res) => {

    const hewan = req.params.hewanId
    const pemilik = req.params.userId
    const currentDate = new Date();

    try {

        if(!hewan){
            const allDataActivity = await PetActivity.findAll({
                where:{
                    hewan_id: hewan
                }
            })
        }

        const isHewanValid = await HewanPeliharaan.findOne({
            where : {
                id: data.hewan_id
            }
        })

        if(!isHewanValid){
            return res.status(404).json({
                response_code: 404,
                message: "Hewan peliharaan tidak ditemukan"
            })
        }

        const dataActivity = await PetActivity.create(data)    
        return res.status(201).json({
            response_code: 201,
            message: "Schedule Pet Activity successfully created.",
            data: dataActivity
        })

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const deleteActivity = async (req, res) => {

    const value = req.params
    const currentDate = new Date();

    try {

        const isActivityExist = await PetActivity.findOne({
            where : {
                id: value.activityId
            }
        })

        if(!isActivityExist){
            return res.status(404).json({
                response_code: 404,
                message: "Jadwal Aktivitas Hewan tidak ditemukan"
            })
        }

        PetActivity.destroy({
            where: {
                id: value.activityId
            }
        })
        return res.status(201).json({
            response_code: 201,
            message: "Schedule Pet Activity successfully deleted.",
        })

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}


module.exports = {
    createActivity,

}