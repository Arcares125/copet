const {Toko, PenyediaJasa, sequelize} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
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

    const dataToko = await sequelize.query(
        `
        SELECT * FROM toko
        `
    )

    try {
        return res.status(200).json({
            message: "Data Toko berhasil diambil",
            kode: 200,
            data: dataToko[0]
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
        GROUP BY a.id, a.nama, a.foto,z.rating, z.total_rating
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

    try {
        // query = `
        // SELECT a.id, a.nama as pet_shop_name,z.rating, z.total_rating,
        // a.deskripsi, a.lokasi, x.service_detail_grooming, x.title_grooming,x.price_grooming,
        // x.service_detail_hotel, x.title_hotel,x.price_hotel
        // from (select CAST(AVG(a.rating) AS DECIMAL(10,2)) AS rating,
        //     COUNT(a.id) as total_rating
        //     from review a join "order" b ON a.order_id = b.id ) z,
        //         (SELECT CASE
        //         WHEN count(b.id) > 0 AND count(c.id) > 0 THEN 'Grooming, Hotel'
        //         WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN 'Hotel'
        //         ELSE 'Grooming'
        //         END AS service, y.title_hotel, y.price_hotel, y.service_detail_hotel,
        //         k.title_grooming, k.price_grooming, k.service_detail_grooming
        //         FROM toko a LEFT JOIN hotel b ON a.id = b.toko_id
        //         LEFT JOIN grooming c ON a.id = c.toko_id, 
        //             (SELECT tipe_hotel as title_hotel, harga as price_hotel, fasilitas as service_detail_hotel FROM hotel) y,
        //             (SELECT tipe as title_grooming, harga as price_grooming, fasilitas as service_detail_grooming FROM grooming) k
        //             GROUP BY y.title_hotel, y.price_hotel, y.service_detail_hotel, 
        //             k.title_grooming, k.price_grooming, k.service_detail_grooming) x,
        // toko a LEFT JOIN hotel b
        // ON a.id = b.toko_id 
        // LEFT JOIN grooming c ON a.id = c.toko_id
        // WHERE a.id = :idToko
        // GROUP BY a.id, a.nama, a.foto,z.rating, z.total_rating,
        // x.service_detail_grooming, x.title_grooming,x.price_grooming,
        // x.service_detail_hotel, x.title_hotel,x.price_hotel
        // `
        query = `
        SELECT a.id, a.nama as pet_shop_name,z.rating, z.total_rating,
        CASE
            WHEN count(b.id) > 0 AND count(c.id) > 0 THEN 'Grooming, Hotel'
            WHEN count(b.id) > 0 AND count(c.id) <= 0 THEN 'Hotel'
            ELSE 'Grooming'
        END AS service,
		JSON_BUILD_OBJECT(
			'hotel', (
			  SELECT JSON_AGG(
				  JSON_BUILD_OBJECT(
					'title', h.tipe_hotel,
					'price', h.harga::varchar,
					'service_detail', h.fasilitas
				  )
			  )
			  FROM hotel AS h
			  WHERE h.toko_id = 1
			),
			'grooming', (
			  SELECT JSON_AGG(
				  JSON_BUILD_OBJECT(
					'title', g.tipe,
					'price', g.harga::varchar,
					'service_detail', g.fasilitas
				  )
			  )
			  FROM grooming AS g
			  WHERE g.id = 1
			)
		  ) AS service, (
			  SELECT JSON_AGG(
				  JSON_BUILD_OBJECT(
					'nama_user', u.nama,
					'rate', r.rating,
					'review_description', r.ulasan
				  )
			  )
			  FROM review r JOIN users u ON r.customer_id = u.id
			) as review
        FROM (SELECT CAST(AVG(a.rating) AS DECIMAL(10,2)) AS rating,
            COUNT(a.id) as total_rating
            FROM review a join "order" b ON a.order_id = b.id ) z,
        toko a LEFT JOIN hotel b
        ON a.id = b.toko_id 
        LEFT JOIN grooming c ON a.id = c.toko_id
        GROUP BY a.id, a.nama, a.foto,z.rating, z.total_rating
        `
        const detail = await sequelize.query(query, 
            { 
                replacements: {
                    idToko: value.id
                },
                type: QueryTypes.SELECT 
            }
        )

        // for (const service of detail) {
        //     const servicesString = service.services.replace('[', '').replace(']', '');
          
        //     const servicesArray = servicesString.split(', ');
          
        //     service.services = servicesArray;
        //   }

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

module.exports = {
    registerToko,
    getDataToko,
    getDetailCardToko,
    getDetailCardTokoFull
}

// SELECT
//   a.id,
//   a.a_name,
//   a.services,
//   (
//     SELECT MIN(service.price)
//     FROM service
//     WHERE service.pet_shop_id = pet_shop.id
//   ) AS start_from,
//   (
//     SELECT AVG(rating)
//     FROM rating
//     WHERE rating.pet_shop_id = pet_shop.id
//   ) AS rating,
//   (
//     SELECT COUNT(*)
//     FROM rating
//     WHERE rating.pet_shop_id = pet_shop.id
//   ) AS total_rating,
//   a.pet_shop_picture,
//   a.description,
//   a.location,
//   (
//     SELECT json_agg(service)
//     FROM service
//     WHERE service.pet_shop_id = pet_shop.id
//   ) AS service
// FROM toko a