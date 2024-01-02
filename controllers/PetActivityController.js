const {
    PetActivity, HewanPeliharaan, User, sequelize
} = require("../models")
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


const createActivity = async (req, res) => {

    const data = req.body
    const pemilik = req.params
    const currentDate = new Date();

    try {

        const isUserValid = await User.findOne({
            where: {
                id: pemilik.userId
            }
        })

        if(!isUserValid){
            return res.status(404).json({
                response_code: 404,
                message: "User tidak ditemukan"
            })
        }

        const isHewanValid = await HewanPeliharaan.findOne({
            where : {
                id: data.hewan_id,
                user_id: pemilik.userId
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

    const activityToUpdate = req.params
    const dataToUpdate = req.body
    const currentDate = new Date();

    try {

        const isActivityExist = await PetActivity.findOne({
            where : {
                id: activityToUpdate.activityId
            }
        })

        if(!isActivityExist){
            return res.status(404).json({
                response_code: 404,
                message: "Jadwal Hewan peliharaan tidak ditemukan"
            })
        }

        await PetActivity.update(
            { 
                nama: dataToUpdate.nama,
                tanggal_aktivitas: dataToUpdate.tanggal_aktivitas,
                mulai_aktivitas: dataToUpdate.mulai_aktivitas,
                akhir_aktivitas: dataToUpdate.akhir_aktivitas,
                isAllDay: dataToUpdate?.isAllDay ? dataToUpdate.isAllDay : false,
                background: dataToUpdate.background ? dataToUpdate.background : null,
                description: dataToUpdate.description ? dataToUpdate.description : null
            },
            { 
                where: { 
                    id: activityToUpdate.activityId 
                } 
            }
        )

        return res.status(201).json({
            response_code: 201,
            message: "Schedule Pet Activity successfully Updated.",
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

        const isUserValid = await User.findOne({
            where:{
                id: pemilik
            }
        })

        if(!isUserValid){
            return res.status(404).json({
                response_code: 404,
                message: "User tidak ditemukan"
            })
        }

        // const isHewanValid = await HewanPeliharaan.findOne({
        //     where : {
        //         id: data.hewan_id
        //     }
        // })

        const listActivity = await sequelize.query(`
            SELECT * FROM pet_activity a LEFT JOIN hewan_peliharaan b 
            ON a.hewan_id = b.id JOIN users c 
            ON b.user_id = c.id
            WHERE c.id = :userId
        `,
        {
            replacements:{
                userId: pemilik
            },
            type: QueryTypes.SELECT,
            // logging:console.log
        })

        return res.status(200).json({
            response_code: 200,
            message: "Schedule Pet Activity successfully retrieved.",
            data: listActivity
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

        await PetActivity.destroy({
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
    updateActivity,
    getListActivity,
    deleteActivity

}