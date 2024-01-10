const {Toko, Hotel, Grooming, PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, BelongsTo } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env
// const fs = require('fs')
const fs = require('fs/promises'); // For file system operations

const path = require('path');
const moment = require('moment-timezone')
const timeZone = 'Asia/Jakarta';

const registerToko = async (req, res) => {

    try {
        const data = req.body
        const currJenisJasa = 'Toko' || 'toko'
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
                replacements: { id: getPenyediaJasaID[0].dataValues.id },
                type: QueryTypes.SELECT
            }
        )

        if(checkRoleTokoPenyediaJasa[0].jenis_jasa === null){

            await PenyediaJasa.update({
                jenis_jasa: 'Toko'
            }, 
            {
                where:{
                    id: data.penyedia_id
                }
            })

            const dataToko = await Toko.create(data)
            return res.status(201).json({
                message: "Data Toko Berhasil Disimpan",
                response_code: 201,
                data: dataToko
            })
        } else if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                message: "Penyedia Jasa hanya dapat mendaftarkan 1 jenis jasa / usaha",
                response_code: 404,
                data: ''
            })
        } else {
         
            const dataToko = await Toko.create(data)
            return res.status(201).json({
                message: "Data Toko Berhasil Disimpan",
                response_code: 201,
                data: dataToko
            })
        } 
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDataToko = async (req, res) => {

    const value = req.body
    
    const dataToko = await sequelize.query(
        `
        SELECT * FROM toko where
        nama ilike :search
        `,
        {
            replacements: {
                search: '%' + value.search  + '%'
            },
            type: QueryTypes.SELECT
        }   
    )
    
    try {
        return res.status(200).json({
            message: "Data Toko berhasil diambil",
            response_code: 200,
            data: dataToko
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDetailCardToko = async (req, res) => {

    let query;
    const param = req.params.search
    let detail;
    const currTime = new Date()

    try {
        // console.log(param)
        if(param){
            query = `
            SELECT a.id, a.nama as pet_shop_name, COALESCE(z.rating, 0) as rating, COALESCE(z.total_rating, 0) as total_rating,
            u.nama, u.no_telp, a.jam_buka, a.jam_tutup, a.foto,
            CASE
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) < MIN(c.harga) THEN MIN(b.harga)
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) > MIN(c.harga) THEN MIN(c.harga)
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) >= MIN(c.harga) THEN MIN(c.harga)
                WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN MIN(b.harga)
                WHEN count(b.id) <= 0 AND count(c.id) > 0  THEN MIN(c.harga)
                ELSE '0'
            END AS start_from,
            CASE
                WHEN count(b.id) > 0 AND count(c.id) > 0 THEN 'Grooming, Hotel'
                WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN 'Hotel'
                WHEN count(b.id) <= 0 AND count(c.id) > 0 THEN 'Grooming'
                ELSE null
            END AS services
            FROM toko a 
            LEFT JOIN hotel b ON a.id = b.toko_id
            LEFT JOIN grooming c ON a.id = c.toko_id
            LEFT JOIN penyedia_jasa u ON u.id = a.penyedia_id
            LEFT JOIN (
                SELECT a.id, CAST(AVG(a.rating) AS DECIMAL(10,2)) AS rating, toko_id,
                COUNT(a.id) as total_rating
                FROM review a 
                JOIN "order" b ON a.order_id = b.id 
                GROUP BY a.id
            ) z ON a.id = z.toko_id
            WHERE a.nama ilike :search
            GROUP BY a.id, a.nama, u.nama, u.no_telp, z.rating, z.total_rating
            `
            detail = await sequelize.query(query, 
                {   
                    replacements: {
                        search: '%' + param + '%'
                    },
                    type: QueryTypes.SELECT 
                }
            )
        } else {
            query = `
            SELECT a.id, a.nama as pet_shop_name, COALESCE(z.rating, 0) as rating, COALESCE(z.total_rating, 0) as total_rating,
            u.nama, u.no_telp, a.jam_buka, a.jam_tutup, a.foto,
            CASE
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) < MIN(c.harga) THEN MIN(b.harga)
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) > MIN(c.harga) THEN MIN(c.harga)
                WHEN count(b.id) > 0 AND count(c.id) > 0 AND MIN(b.harga) >= MIN(c.harga) THEN MIN(c.harga)
                WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN MIN(b.harga)
                WHEN count(b.id) <= 0 AND count(c.id) > 0  THEN MIN(c.harga)
                ELSE '0'
            END AS start_from,
            CASE
                WHEN count(b.id) > 0 AND count(c.id) > 0 THEN 'Grooming, Hotel'
                WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN 'Hotel'
                WHEN count(b.id) <= 0 AND count(c.id) > 0 THEN 'Grooming'
                ELSE null
            END AS services
            FROM toko a 
            LEFT JOIN hotel b ON a.id = b.toko_id
            LEFT JOIN grooming c ON a.id = c.toko_id
            LEFT JOIN penyedia_jasa u ON u.id = a.penyedia_id
            LEFT JOIN (
                SELECT toko_id, CAST(SUM(rating) AS DECIMAL(10,2)) / COUNT(id) AS rating, COUNT(id) as total_rating
                FROM review 
                GROUP BY toko_id
            ) z ON a.id = z.toko_id
            GROUP BY a.id, a.nama, u.nama, u.no_telp, z.rating, z.total_rating
        `
            detail = await sequelize.query(query, 
                {   
                    type: QueryTypes.SELECT 
                }
            )
        }
        //redeploy flag
        let serviceDetail = []

        let isOpen = true;
        
        for (const service of detail) {
            if(service.services === null){
                //do nothing
            } else {

                const currTime = moment().tz(timeZone);
                const jamBuka = moment.utc(service.jam_buka).format('HH:mm');
                const jamTutup = moment.utc(service.jam_tutup).format('HH:mm');
                const currMoment = currTime.format('HH:mm');

                if (moment(currMoment, 'HH:mm').isAfter(moment(jamBuka, 'HH:mm')) && moment(currMoment, 'HH:mm').isBefore(moment(jamTutup, 'HH:mm'))) {
                    isOpen = {is_open: true}
                } else {
                    isOpen = {is_open: false}
                }

                if(service.rating === null || service.rating === 0){
                    service.rating = 0.00.toFixed(2);
                } else {
                    service.rating = parseFloat(service.rating).toFixed(2);
                }
                
                const servicesString = service.services.replace('[', '').replace(']', '');
            
                const servicesArray = servicesString.split(', ');
            
                service.services = servicesArray;

                const mergeIsOpenWithDetail = {...service, ...isOpen}

                serviceDetail.push(mergeIsOpenWithDetail)
            }
          }

          if(serviceDetail.length === 0){
            return res.status(200).json({
                message: "Tidak ada Toko tersedia / Belum ada Toko yang memiliki service",
                response_code: 200,
                data: serviceDetail
            })
          } else {
            return res.status(200).json({
                message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
                response_code: 200,
                data: serviceDetail
            })
          }
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDetailCardTokoFull = async (req, res) => {

    const value = req.params
    let query;
    let data;

    try {
        data = await Toko.findAll({
            attributes: [
                'id', ['nama', 'pet_shop_name'],
                [sequelize.literal('(SELECT MIN(harga) FROM (SELECT harga FROM Hotel UNION ALL SELECT harga FROM Grooming) AS harga)'), 'start_from'],
                ['deskripsi', 'description'],
                ['lokasi', 'location'],
                ['foto', 'pet_shop_picture'],
                ['jam_buka', 'open_time'],
                ['jam_tutup', 'close_time'],
                [sequelize.literal(`(SELECT CAST(AVG(a.rating) AS DECIMAL(10,2)) FROM review a JOIN "order" b ON a.order_id = b.id WHERE a.toko_id = ${value.id})`), 'rating'],
                [sequelize.literal(`(SELECT COUNT(a.id) as total_rating FROM review a JOIN "order" b ON a.order_id = b.id WHERE a.toko_id = ${value.id})`), 'total_rating'],
                [sequelize.literal(`(SELECT json_agg(json_build_object('nama_user', u.nama, 'rate', r.rating, 'review_description', r.ulasan)) FROM review r JOIN users u ON r.customer_id = u.id WHERE r.toko_id = ${value.id})`), 'review']            
            ],
            include: [
                {
                    model: Hotel,
                    as: 'hotels',
                    attributes: ['id', 'toko_id',
                    ['tipe_hotel', 'title_hotel'], 
                    ['harga', 'price_hotel'], 
                    [sequelize.fn('string_to_array', sequelize.col('hotels.fasilitas'), ','), 'service_detail_hotel']
                ],                    
                    where:{
                        toko_id: value.id
                    },
                    required: false,
                },
                {
                    model: Grooming,
                    as: 'groomings',
                    attributes: ['id', 'toko_id', 
                    ['tipe', 'title_grooming'], 
                    ['harga', 'price_grooming'], 
                    [sequelize.fn('string_to_array', sequelize.col('groomings.fasilitas'), ','), 'service_detail_grooming']
                ],                   
                where:{
                    toko_id: value.id
                },
                    required: false,
                },
            ],
            where: {
                id: value.id
            },
            // logging: console.log
        })

        data = data.map(toko => {
            const tokoPlain = toko.get({ plain: true });
            let {hotels, groomings, ...otherData} = tokoPlain;
            let services = [];
            let is_open;
            if (hotels && hotels.length > 0) {
                services.push('Hotel');
            } else {
                hotels = null
            }
            if (groomings && groomings.length > 0) {
                services.push('Grooming');
            } else {
                groomings = null
            }

            if (otherData.rating === null) {
                otherData.rating = 0.00.toFixed(2);
            } else {
                otherData.rating = parseFloat(otherData.rating).toFixed(2);
            }//redeploy

            const currTime = moment().tz(timeZone);
            const jamBuka = moment.utc(otherData.open_time).format('HH:mm');
            const jamTutup = moment.utc(otherData.close_time).format('HH:mm');
            const currMoment = currTime.format('HH:mm');
            
            if (moment(currMoment, 'HH:mm').isAfter(moment(jamBuka, 'HH:mm')) && moment(currMoment, 'HH:mm').isBefore(moment(jamTutup, 'HH:mm'))) {
                is_open = true;
            } else {
                is_open = false;
            }

            return {
                ...otherData,
                services,
                hotels,
                groomings,
                is_open
            };
        });

        return res.status(200).json({
            message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
            response_code: 200,
            data: data[0]
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDetailTokoPenyedia = async (req, res) => {

    const value = req.params
    let query;
    let data;

    try {
        data = await Toko.findAll({
            attributes: [
                'id', ['nama', 'pet_shop_name'], 'penyedia_id',
                [sequelize.literal('(SELECT MIN(harga) FROM (SELECT harga FROM Hotel UNION ALL SELECT harga FROM Grooming) AS harga)'), 'start_from'],
                ['deskripsi', 'description'],
                ['lokasi', 'location'],
                ['foto', 'pet_shop_picture'],
                ['jam_buka', 'open_time'],
                ['jam_tutup', 'close_time'],
                [sequelize.literal('(SELECT CAST(AVG(a.rating) AS DECIMAL(10,2)) FROM review a JOIN "order" b ON a.order_id = b.id)'), 'rating'],
                [sequelize.literal('(SELECT COUNT(a.id) as total_rating FROM review a JOIN "order" b ON a.order_id = b.id)'), 'total_rating'],
                [sequelize.literal(`(SELECT json_agg(json_build_object('nama_user', u.nama, 'rate', r.rating, 'review_description', r.ulasan)) FROM review r JOIN users u ON r.customer_id = u.id)`), 'review']            
            ],
            include: [
                {
                    model: Hotel,
                    as: 'hotels',
                    attributes: ['id', 'toko_id',
                    ['tipe_hotel', 'title_hotel'], 
                    ['harga', 'price_hotel'], 
                    [sequelize.fn('string_to_array', sequelize.col('hotels.fasilitas'), ','), 'service_detail_hotel']
                ],                    
                    where:
                        sequelize.where(sequelize.col('hotels.toko_id'), '=', sequelize.col('Toko.id'))
                        // toko_id: sequelize.col('Toko.id')
                    ,
                    required: false,
                },
                {
                    model: Grooming,
                    as: 'groomings',
                    attributes: ['id', 'toko_id', 
                    ['tipe', 'title_grooming'], 
                    ['harga', 'price_grooming'], 
                    [sequelize.fn('string_to_array', sequelize.col('groomings.fasilitas'), ','), 'service_detail_grooming']
                ],                   
                // where:{
                //     toko_id: sequelize.col('Toko.id')
                // },
                    where:  sequelize.where(sequelize.col('groomings.toko_id'), '=', sequelize.col('Toko.id')),
                    required: false,
                },
            ],
            where: {
                penyedia_id: value.penyediaId
            },
            // logging: console.log
        })

        data = data.map(toko => {
            const tokoPlain = toko.get({ plain: true });
            let {hotels, groomings, ...otherData} = tokoPlain;
            let services = [];
            let is_open;
            if (hotels && hotels.length > 0) {
                services.push('Hotel');
            } else {
                hotels = null
            }
            if (groomings && groomings.length > 0) {
                services.push('Grooming');
            } else {
                groomings = null
            }

            if (otherData.rating === null) {
                otherData.rating = 0.00.toFixed(2);
            } else {
                otherData.rating = parseFloat(otherData.rating).toFixed(2);
            }

            const currTime = moment().tz(timeZone);
            const jamBuka = moment.utc(otherData.open_time).format('HH:mm');
            const jamTutup = moment.utc(otherData.close_time).format('HH:mm');
            const currMoment = currTime.format('HH:mm');
            
            if (moment(currMoment, 'HH:mm').isAfter(moment(jamBuka, 'HH:mm')) && moment(currMoment, 'HH:mm').isBefore(moment(jamTutup, 'HH:mm'))) {
                is_open = true;
            } else {
                is_open = false;
            }

            return {
                ...otherData,
                services,
                hotels,
                groomings,
                is_open
            };
        });

        return res.status(200).json({
            message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
            response_code: 200,
            data: data[0]
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getPackageListStore = async (req, res) => {

    const value = req.params

    try {

        // const data = await Toko.findAll({
        //     where: {
        //         id: value.toko_id,

        //     }
        // })
        
        let services;

        if(value.service_type === 'grooming' || value.service_type === 'Grooming'){
            services = await sequelize.query(`
            SELECT id as item_id, tipe as title, harga as price
            FROM grooming
            WHERE toko_id = :idToko
            `,
                {
                    replacements: {
                        idToko: value.toko_id
                    },
                    type: QueryTypes.SELECT,
                    logging: console.log
                },
            )
        }

        if(value.service_type === 'hotel' || value.service_type === 'Hotel'){
            services = await sequelize.query(`
            SELECT id as item_id, tipe_hotel as title, harga as price
            FROM hotel
            WHERE toko_id = :idToko
            `,
                {
                    replacements: {
                        idToko: value.toko_id
                    },
                    type: QueryTypes.SELECT,
                    // logging: console.log
                },
            )
        }

        return res.status(200).json({
            message: "Success",
            response_code: 200,
            data: services
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const cekTokoData = async(req, res) =>{

    try {
        const data = await Toko.findAll()
        return res.json({
            data: data
        })
    } catch (error) {
        return res.json({
            message: "lmao"
        })
    }
}

const updateToko = async (req, res) =>{

    const value = req.params
    const data = req.body

    try {

        await Toko.update({
            nama: data.nama,
            deskripsi: data.deskripsi,
            jam_tutup: data.jam_tutup,
            jam_buka: data.jam_buka,
            lokasi: data.lokasi,
            foto: data.foto
        }, {
            where:{
                id: value.tokoId
            }
        })

        return res.status(200).message({
            response_code: 200,
            message: "Data has been updated!",
            data: data
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).message({
            response_code: 500,
            message: "Internal server error",
            error: error.message
        })
    }
}

module.exports = {
    registerToko,
    getDataToko,
    getDetailCardToko,
    getDetailCardTokoFull,
    getPackageListStore,
    getDetailTokoPenyedia,
    cekTokoData,
    updateToko
}