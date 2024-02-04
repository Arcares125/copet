const {User, PenyediaJasa, Admin, sequelize, Sequelize, Toko, Dokter, Trainer} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env


// const registerAdmin = async (req, res) => {
//     // const {nama, email, phone, gender, password} = req.body
//     const data = req.body
//     try {
//         const passHash = await bcrypt.hash(data.password, saltRounds);


//         const isEmailValid = await PenyediaJasa.findOne({
//             where:{
//                 email: data.email
//             }
//         })

//         if(isEmailValid){
//             res.status(200).json({
//                 message: "Email sudah digunakan",
//             })    
//         } else {
//             const result = await PenyediaJasa.create({...data, password: passHash})
//             res.status(200).json({
//                 message: "Register Success",
//                 data: result
//             })    
//         }
//     } catch (error) {
//         res.status(500).json({
//             response_code: 500,
//             message: error.message
//         })
//     }
// }

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
                is_acc: true
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
                is_acc: true
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
                is_acc: true
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
            let penyediaJasaList = []
            for(let dataPenyedia of dataPenyediaJasa){
                const penyediaJasaTemp = {
                    id: dataPenyedia.dataValues.id,
                    email: dataPenyedia.dataValues.email,
                    no_telp: dataPenyedia.dataValues.no_telp,
                    username: dataPenyedia.dataValues.nama,
                    jenis_jasa: dataPenyedia.dataValues.jenis_jasa,
                    is_acc: dataPenyedia.dataValues.is_acc
                }
                penyediaJasaList.push(penyediaJasaTemp)
            }

            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa ditemukan.",
                data: penyediaJasaList
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

const getAllDataPenyediaJasaIsNotAcc = async (req, res) =>{
    try {
        
        let mergeData = []
        const dataPenyediaJasa = await PenyediaJasa.findAll()

        if(dataPenyediaJasa.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa Kosong!"
            })
        } else {
            const dataDokter = await Dokter.findAll({
                where:{
                    is_acc: false
                }
            })
    
            const dataTrainer = await Trainer.findAll({
                where:{
                    is_acc: false
                }
            })
    
            const dataToko = await Toko.findAll({
                where:{
                    is_acc: false
                }
            })

            if(dataDokter.length > 0){
                for(let dataDokterTemp of dataDokter){
                    const dokterTemp = {
                        id: dataDokterTemp.dataValues.id,
                        penyedia_id: dataDokterTemp.dataValues.penyedia_id,
                        nama: dataDokterTemp.dataValues.nama,
                        spesialis: dataDokterTemp.dataValues.spesialis,
                        pengalaman: dataDokterTemp.dataValues.pengalaman,
                        harga: dataDokterTemp.dataValues.harga,
                        alumni: dataDokterTemp.dataValues.alumni,
                        lokasi_praktek: dataDokterTemp.dataValues.lokasi_praktek,
                        is_acc: dataDokterTemp.dataValues.is_acc,
                        service_type: "Dokter"
                    }
                    mergeData.push(dokterTemp)
                }
            }
            
            if(dataTrainer.length > 0){
                for(let dataTrainerTemp of dataTrainer){
                    const trainerTemp = {
                        id: dataTrainerTemp.dataValues.id,
                        penyedia_id: dataTrainerTemp.dataValues.penyedia_id,
                        nama: dataTrainerTemp.dataValues.nama,
                        spesialis: dataTrainerTemp.dataValues.spesialis,
                        pengalaman: dataTrainerTemp.dataValues.pengalaman,
                        harga: dataTrainerTemp.dataValues.harga,
                        lokasi: dataTrainerTemp.dataValues.lokasi,
                        is_acc: dataTrainerTemp.dataValues.is_acc,
                        service_type: "Trainer"
                    }
                    mergeData.push(trainerTemp)
                }
            }

            if(dataToko.length > 0){
                for(let dataTokoTemp of dataToko){
                    const tokoTemp = {
                        id: dataTokoTemp.dataValues.id,
                        penyedia_id: dataTokoTemp.dataValues.penyedia_id,
                        nama: dataTokoTemp.dataValues.nama,
                        deskripsi: dataTokoTemp.dataValues.deskripsi,
                        lokasi: dataTokoTemp.dataValues.lokasi,
                        is_acc: dataTokoTemp.dataValues.is_acc,
                        service_type: "Toko"
                    }
                    mergeData.push(tokoTemp)
                }
            }

            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa yang belum ter-konfirmasi ditemukan.",
                data: mergeData.sort((a, b) => b.order_id - a.order_id)
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

const getAllDataPenyediaJasaIsAcc = async (req, res) =>{
    try {
        
        let mergeData = []
        const dataPenyediaJasa = await PenyediaJasa.findAll()

        if(dataPenyediaJasa.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa Kosong!"
            })
        } else {
            const dataDokter = await Dokter.findAll({
                where:{
                    is_acc: true
                }
            })
    
            const dataTrainer = await Trainer.findAll({
                where:{
                    is_acc: true
                }
            })
    
            const dataToko = await Toko.findAll({
                where:{
                    is_acc: true
                }
            })

            if(dataDokter.length > 0){
                for(let dataDokterTemp of dataDokter){
                    const dokterTemp = {
                        id: dataDokterTemp.dataValues.id,
                        penyedia_id: dataDokterTemp.dataValues.penyedia_id,
                        nama: dataDokterTemp.dataValues.nama,
                        spesialis: dataDokterTemp.dataValues.spesialis,
                        pengalaman: dataDokterTemp.dataValues.pengalaman,
                        harga: dataDokterTemp.dataValues.harga,
                        alumni: dataDokterTemp.dataValues.alumni,
                        lokasi_praktek: dataDokterTemp.dataValues.lokasi_praktek,
                        is_acc: dataDokterTemp.dataValues.is_acc
                    }
                    mergeData.push(dokterTemp)
                }
            }
            
            if(dataTrainer.length > 0){
                for(let dataTrainerTemp of dataTrainer){
                    const trainerTemp = {
                        id: dataTrainerTemp.dataValues.id,
                        penyedia_id: dataTrainerTemp.dataValues.penyedia_id,
                        nama: dataTrainerTemp.dataValues.nama,
                        spesialis: dataTrainerTemp.dataValues.spesialis,
                        pengalaman: dataTrainerTemp.dataValues.pengalaman,
                        harga: dataTrainerTemp.dataValues.harga,
                        lokasi: dataTrainerTemp.dataValues.lokasi,
                        is_acc: dataTrainerTemp.dataValues.is_acc
                    }
                    mergeData.push(trainerTemp)
                }
            }

            if(dataToko.length > 0){
                for(let dataTokoTemp of dataToko){
                    const tokoTemp = {
                        id: dataTokoTemp.dataValues.id,
                        penyedia_id: dataTokoTemp.dataValues.penyedia_id,
                        nama: dataTokoTemp.dataValues.nama,
                        spesialis: dataTokoTemp.dataValues.spesialis,
                        pengalaman: dataTokoTemp.dataValues.pengalaman,
                        harga: dataTokoTemp.dataValues.harga,
                        lokasi: dataTokoTemp.dataValues.lokasi,
                        is_acc: dataTokoTemp.dataValues.is_acc
                    }
                    mergeData.push(tokoTemp)
                }
            }

            return res.status(200).json({
                response_code: 200,
                message: "Data Penyedia Jasa yang belum ter-konfirmasi ditemukan.",
                data: mergeData.sort((a, b) => b.order_id - a.order_id)
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

const getAllDataUser = async (req, res) =>{

    try {
        
        const dataUser = await User.findAll()

        if(dataUser.length === 0){
            return res.status(200).json({
                response_code: 200,
                message: "Data User Kosong!"
            })
        } else {

            let allUser = []

            for(let dataUserTemp of dataUser){
                const userList = {
                    id: dataUserTemp.dataValues.id,
                    email: dataUserTemp.dataValues.email,
                    no_telp: dataUserTemp.dataValues.no_telp,
                    username: dataUserTemp.dataValues.nama
                }

                allUser.push(userList)
            }
            

            return res.status(200).json({
                response_code: 200,
                message: "Data User ditemukan.",
                data: allUser
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
    getAllDataPenyediaJasa,
    getAllDataPenyediaJasaIsNotAcc,
    getAllDataPenyediaJasaIsAcc,
    getAllDataUser
}