const { Op } = require('sequelize');
const { HewanPeliharaan, User } = require('../models')

const getHewanPeliharaan = async (req, res) =>{
    const id = req.params.id
    try {

        let getHewan;
        if(!id){
            getHewan = await HewanPeliharaan.findAll({
                include: {
                        model: User,
                        as: "pemilik_hewan",
                        attributes: ['id', 'nama']
                    },
                where: {
                    nama_hewan: {
                        [Op.substring]: req.query.nama_hewan
                    }
                }
            })
        } else {
            getHewan = await HewanPeliharaan.findByPk(id)
        }

        if(getHewan.length > 0){
            return res.status(200).json({
                response_code: 200,
                message: "Hewan ditemukan",
                data: getHewan
            })
        } else {
            return res.status(404).json({
                response_code: 404,
                message: "Data Hewan tidak ditemukan",
                data: getHewan
            })
        }
        
        // if(getHewan.length < 1) return res.status(404).json({
        //     message: "Hewan tidak ditemukan"
        // })

        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const createHewanPeliharaan = async (req, res) => {
    const data = req.body
    try {

        const userIsValid = await User.findOne({
            where:{
                id: data.user_id
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: 404,
                message: "Data User / Pengguna tidak ditemukan",
            })
        }

        const dataHewan = await HewanPeliharaan.create(data)
        return res.status(201).json({
            response_code: 201,
            message: "Data Hewan Berhasil Disimpan",
            data: dataHewan
        })
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

module.exports = {
    createHewanPeliharaan,
    getHewanPeliharaan
}