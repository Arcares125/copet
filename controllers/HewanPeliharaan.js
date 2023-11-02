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
                message: "Hewan ditemukan",
                kode: 200,
                data: getHewan
            })
        } else {
            return res.status(404).json({
                message: "Data Hewan tidak ditemukan",
                kode: 404,
                data: getHewan
            })
        }
        
        // if(getHewan.length < 1) return res.status(404).json({
        //     message: "Hewan tidak ditemukan"
        // })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const createHewanPeliharaan = async (req, res) => {
    const data = req.body
    try {
        const dataHewan = await HewanPeliharaan.create(data)
        return res.status(201).json({
            message: "Data Hewan Berhasil Disimpan",
            kode: 201,
            data: dataHewan
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    createHewanPeliharaan,
    getHewanPeliharaan
}