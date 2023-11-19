const {Toko, Hotel, Grooming, PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, BelongsTo } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

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
        console.log(getPenyediaJasaID[0].dataValues.id)
        if(currJenisJasa !== checkRoleTokoPenyediaJasa[0].jenis_jasa ||
            getDokterTaken.length > 0 || getTrainerTaken.length > 0 || getTokoTaken.length > 0){
            return res.status(404).json({
                message: "Penyedia Jasa hanya dapat mendaftarkan 1 jenis jasa / usaha",
                kode: 404,
                data: ''
            })
        } else {
            const dataToko = await Toko.create(data)
            return res.status(201).json({
                message: "Data Toko Berhasil Disimpan",
                kode: 201,
                data: dataToko
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
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
            kode: 200,
            data: dataToko
        })

        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const getDetailCardToko = async (req, res) => {

    let query;

    try {
        query = `
        SELECT a.id, a.nama as pet_shop_name,z.rating, z.total_rating,
        u.nama, u.no_telp,
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
            ELSE 'Grooming'
        END AS services
        from (select CAST(AVG(a.rating) AS DECIMAL(10,2)) AS rating,
            COUNT(a.id) as total_rating
            from review a join "order" b ON a.order_id = b.id ) z,
        toko a LEFT JOIN hotel b
        ON a.id = b.toko_id
        LEFT JOIN grooming c ON a.id = c.toko_id
        LEFT JOIN penyedia_jasa u ON u.id = a.penyedia_id
        GROUP BY a.id, a.nama, a.foto,z.rating, z.total_rating, u.nama, u.no_telp
        `
        const detail = await sequelize.query(query, 
            { type: QueryTypes.SELECT }
        )

        for (const service of detail) {
            const servicesString = service.services.replace('[', '').replace(']', '');
          
            const servicesArray = servicesString.split(', ');
          
            service.services = servicesArray;
          }

        return res.status(200).json({
            message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
            kode: 200,
            data: detail
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
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
            logging: console.log
        })

        data = data.map(toko => {
            const tokoPlain = toko.get({ plain: true });
            const {hotels, groomings, ...otherData} = tokoPlain;
            let services = [];
            if (hotels && hotels.length > 0) {
                services.push('Hotel');
            }
            if (groomings && groomings.length > 0) {
                services.push('Grooming');
            }
            return {
                ...otherData,
                services,
                hotels,
                groomings,
            };
        });

        return res.status(200).json({
            message: "Data Detail Toko Grooming dan Hotel berhasil diambil",
            kode: 200,
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
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
                    logging: console.log
                },
            )
        }

        return res.status(200).json({
            message: "Success",
            kode: 200,
            data: services
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    registerToko,
    getDataToko,
    getDetailCardToko,
    getDetailCardTokoFull,
    getPackageListStore
}