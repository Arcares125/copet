const {Dokter,
    PenyediaJasa, 
    sequelize, 
    Order, 
    VirtualAccount, 
    DetailOrderGrooming, 
    DetailOrderHotel, 
    Grooming, 
    Hotel,
    Toko,
    User,
    Review} = require("../models")
    const { Op } = require('sequelize');
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env
        const midtransClient = require('midtrans-client');


const createOrder = async (req, res) => {

    const data = req.body
    const currentDate = new Date();
    let details = [];
    let totalPrice = 0;

    try {

        const dataOrder = await Order.create({
            toko_id: data.toko_id,
            user_id: data.user_id,
            status_order: "Waiting Payment",
            metode_pembayaran: data.metode_pembayaran,
            status_pembayaran: "Pending",
            tanggal_order: currentDate
        })

        if(data.service_type === 'Grooming' || data.service_type === 'grooming'){

            for(let i = 0; i < data.order_detail.length; i++) {

                const getPrice = await Grooming.findOne({
                    where: {
                        id: data.order_detail[i].grooming_id
                    }
                })

                if(!getPrice){
                    return res.status(404).json({
                        message: "Data Grooming tidak ditemukan / tidak terdaftar"
                    })
                }

                const price = getPrice.dataValues.harga*data.order_detail[i].quantity
                totalPrice += price;

                const dataDetailGrooming = await DetailOrderGrooming.create({
                    order_id: dataOrder.dataValues.id,
                    grooming_id: data.order_detail[i].grooming_id,
                    tanggal_grooming: data.tanggal_grooming,
                    alamat_pelanggan_grooming: "0",
                    metode_penjemputan_grooming: "0",
                    discount: 0,
                    quantity: data.order_detail[i].quantity
                })

                const merge = {
                    ...dataDetailGrooming.dataValues,
                    gross_price: price
                }

                details.push(merge)
            }
        } else if(data.service_type === 'Hotel' || data.service_type === 'hotel') {

            for(let i = 0; i < data.order_detail.length; i++) {

                const getPrice = await Hotel.findOne({
                    where: {
                        id: data.order_detail[i].hotel_id
                    }
                })
    
                if(!getPrice){
                    return res.status(404).json({
                        message: "Data Hotel tidak ditemukan / tidak terdaftar"
                    })
                }

                const price = getPrice.dataValues.harga*data.order_detail[i].quantity
                totalPrice += price;

                const dataDetailHotel = await DetailOrderHotel.create({
                    order_id: dataOrder.dataValues.id,
                    hotel_id: data.order_detail[i].hotel_id,
                    tanggal_masuk: data.tanggal_masuk,
                    tanggal_keluar: data.tanggal_keluar,
                    metode_penjemputan: "0",
                    discount: 0,
                    quantity: data.order_detail[i].quantity
                })
                const merge = {
                    ...dataDetailHotel.dataValues,
                    gross_price: price,
                }

                details.push(merge)
            }
        }

        //MIDTRANS PAYMENT
        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        
        let parameter = {
            "payment_type": "bank_transfer",
            "transaction_details": {
                "order_id": dataOrder.dataValues.id,
                "gross_amount": totalPrice
            },
            "custom_expiry":
            {   
                // "order_time":  dataOrder.dataValues.tanggal_order,
                "expiry_duration": 15,
                "unit": "minute"
            },
            "bank_transfer": {
                "bank": "bca"
            },
            "name_payment": "BCA Virtual Account"
        };
        
        
        coreApi.charge(parameter).then(async (chargeResponse) => {
            console.log('Charge transaction response:', chargeResponse);

            const nama = parameter.name_payment
            let kode = chargeResponse.va_numbers[0].va_number
            // const dataTrans = await VirtualAccount.create({
            //     nama: parameter.name_payment,
            //     kode: chargeResponse.va_numbers[0].va_number
            // })
        
            // const {id, nama, kode} = dataTrans

            const updateVaOrder = await Order.update(
                { 
                    virtual_number: kode,
                    // updatedAt: currentDate
                },
                { where: {id: dataOrder.dataValues.id} }
            )
        
            return res.status(200).json({
                message: "Data Order Berhasil Disimpan",
                response_code: 200,
                data: {
                    order: dataOrder.dataValues,
                    detail: details,
                    total_price: totalPrice,
                    nama,
                    kode,
                    'transactionStatus': chargeResponse.transaction_status, 
                    'fraudStatus': chargeResponse.fraud_status
                }
            })
        }).catch((e) => {
            console.log('Error occured:', e.message);
            if(e.message.includes('HTTP status code: 406')){
                return res.status(200).json({
                    message: "Order ID has been used, try another order ID"
                })
            } 
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}
const getPaymentData = async (req, res) => {

    try {

        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        
        let parameter = {
            "payment_type": "bank_transfer",
            "transaction_details": {
                "order_id": req.body.order_id,
                "gross_amount": req.body.gross_amount
            },
            "custom_expiry":
            {
                "expiry_duration": 15,
                "unit": "minute"
            },
            "bank_transfer": {
                "bank": "bca"
            },
            "name_payment": "BCA Virtual Account"
        };
        
        
        coreApi.charge(parameter).then(async (chargeResponse) => {
            console.log('Charge transaction response:', chargeResponse);
        
            const dataTrans = await VirtualAccount.create({
                nama: parameter.name_payment,
                kode: chargeResponse.va_numbers[0].va_number
            })
        
            const {id, nama, kode} = dataTrans
        
            return res.status(200).json({
                'response_code': 200, 
                id,
                'order_id': chargeResponse.order_id,
                nama,
                kode,
                'transactionStatus': chargeResponse.transaction_status, 
                'fraudStatus': chargeResponse.fraud_status
            });
        }).catch((e) => {
            console.log('Error occured:', e.message);
            if(e.message.includes('HTTP status code: 406')){
                return res.status(200).json({
                    message: "Order ID has been used, try another order ID"
                })
            } 
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const checkPaymentStatus = async (req, res) => {

    try {

        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        
        // let parameter = req.body;

        let orderId = req.body.order_id; 

        const orderIsValid = await Order.findOne({
            where: {
                id: orderId
            }
        })

        if(!orderIsValid){
            return res.status(404).json({
                "response_code": 404,
                "message": "Order not found"
            })
        }
        
        coreApi.transaction.status(orderId).then(async (response) => {
            // console.log(response)
            console.log('Transaction status:', response.transaction_status);

            if (response.transaction_status === 'settlement') {
                console.log('Transaction is successful');

                const updateStatusPayment = await Order.update(
                    { 
                        status_pembayaran: "Berhasil",
                        status_order: "On Progress"
                    },
                    { where: {id: orderId} }
                )

                return res.status(200).json({
                    "response_code": 200,
                    "Transaction Status": "Paid"
                })
            } else if(response.transaction_status === 'expire'){

                console.log('Transaction is expired');

                const updateStatusPayment = await Order.update(
                    { 
                        status_pembayaran: "Expired",
                        status_order: "Expired"
                    },
                    { where: {id: orderId} }
                )

                return res.status(200).json({
                    "response_code": 200,
                    "Transaction Status": "Expired"
                })
            } else {
                console.log('Transaction is not successful');
                return res.status(200).json({
                    "response_code": 200,
                    "Transaction Status": response.transaction_status
                })
            }
        }).catch((e) => {
            console.log('Error occured:', e.message);
            if(e.message.includes('HTTP status code: 404')){
                return res.status(200).json({
                    message: "Order ID Not Found"
                })
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const setPaymentToExpired = async (req, res) => {

    try {

        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        
        let orderId = req.params.orderId; 

        const orderIsValid = await Order.findOne({
            where: {
                id: orderId
            }
        })

        if(!orderIsValid){
            return res.status(404).json({
                "response_code": 404,
                "message": "Order not found"
            })
        }
        
        coreApi.transaction.status(orderId).then(async (response) => {
            console.log('Transaction status:', response.transaction_status);
        
            if(response.transaction_status === 'expire') {
                return res.status(200).json({
                    "response_code": 200,
                    "message": "Transaction is already expired"
                })
            } else {
                return coreApi.transaction.expire(orderId).then(async (response) => {
                    console.log('Transaction status after expire:', response.transaction_status);
        
                    const updateStatusPayment = await Order.update(
                        { 
                            status_pembayaran: "Expired",
                            status_order: "Cancel"
                        },
                        { where: {id: orderId} }
                    )
        
                    return res.status(200).json({
                        "response_code": 200,
                        "Transaction Status": "Expired"
                    })
                }).catch((e) => {
                    console.log('Error occured:', e.message);
                });
            }
        }).catch((e) => {
            console.log('Error occured:', e.message);
            if(e.message.includes('HTTP status code: 404')){
                return res.status(200).json({
                    message: "Order ID Not Found"
                })
            } else if(e.message.includes('HTTP status code: 500')){
                return res.status(500).json({
                    message: "Sorry. Our system is recovering from unexpected issues. Please retry."
                })
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

const getDetailOrder = async (req, res) => {

    const value = req.params

    try {
        const data = await Toko.findAll({
            attributes: [
                ['id', 'id_toko'], ['nama', 'pet_shop_name'],
            ],
            include: [
                {
                    model: Hotel,
                    as: 'hotels',
                    attributes: ['id', 'toko_id',
                    ['tipe_hotel', 'title_hotel'], 'harga', 
                ],                    
                    required: false,
                    include: [
                        {
                            model: DetailOrderHotel,
                            as: 'detail_order_hotel',
                            attributes: ['quantity'],
                            required: true,
                            where: {
                                order_id: value.orderId
                            },
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order', "metode_pembayaran", "status_pembayaran", "virtual_number", "tanggal_order"],
                                include: [
                                    {
                                        model: User,
                                        as: 'users',
                                        attributes: [['id', 'user_id']]
                                    },
                                    {
                                        model: Review,
                                        as: 'reviews',
                                        attributes: [['rating', 'review'], ['ulasan', 'review_description']],
                                        // where: {
                                        //     id: value.orderId
                                        // }
                                    }
                                ],
                                where: {
                                    id: value.orderId
                                },
                            }]
                        },
                    ]
                },
                // ====
                {
                    model: Grooming,
                    as: 'groomings',
                    attributes: ['id', 'toko_id',
                    ['tipe', 'title_grooming'], 'harga', 
                ],                    
                    required: false,
                    include: [
                        {
                            model: DetailOrderGrooming,
                            as: 'detail_order_grooming',
                            attributes: ['quantity'],
                            required: true,
                            where: {
                                order_id: value.orderId
                            },
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order', "metode_pembayaran", "status_pembayaran", "virtual_number", "tanggal_order"],
                                include: [
                                    {
                                        model: User,
                                        as: 'users',
                                        attributes: [['id', 'user_id']]
                                    },
                                    {
                                        model: Review,
                                        as: 'reviews',
                                        attributes: [['rating', 'review'], 'ulasan'],
                                        // where: {
                                        //     id: value.orderId
                                        // }
                                    }
                                ],
                                where: {
                                    id: value.orderId
                                },
                            }]
                        },
                    ]
                },
            ],

            // logging: console.log
        });

        let totalPrice = 0;

        // await sequelize.transaction(async (t) =>{
        //     try {
        //         let coreApi = new midtransClient.CoreApi({
        //             isProduction: false,
        //             serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
        //             clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        //         });
        
        //         await coreApi.transaction.status(value.orderId).then(async (response) => {
        //             // console.log(response)
        //             console.log('Transaction status:', response.transaction_status);
        
        //             if (response.transaction_status === 'settlement') {
        //                 console.log('Transaction is successful');
        
        //                 const updateStatusPayment = await Order.update(
        //                     { 
        //                         status_pembayaran: "Berhasil",
        //                         status_order: "On Progress"
        //                     },
        //                     {   
        //                         transaction: t,
        //                         where: {id: value.orderId} 
        //                     }
        //                 )
        
        //                  // Commit the transaction here
        
        //                 // return res.status(200).json({
        //                 //     "response_code": 200,
        //                 //     "Transaction Status": "Paid"
        //                 // })
        //             } else if(response.transaction_status === 'expire'){
        
        //                 console.log('Transaction is expired');
        
        //                 const updateStatusPayment = await Order.update(
        //                     { 
        //                         status_pembayaran: "Expired",
        //                         status_order: "Expired"
        //                     },
        //                     {   
        //                         transaction: t,
        //                         where: {id: value.orderId} 
        //                     }
        //                 )
        
        //                  // Commit the transaction here
        
        //                 // return res.status(200).json({
        //                 //     "response_code": 200,
        //                 //     "Transaction Status": "Expired"
        //                 // })
        //             } else {
        //                 console.log('Transaction is not successful');
        //                 // return res.status(200).json({
        //                 //     "response_code": 200,
        //                 //     "Transaction Status": response.transaction_status
        //                 // })
        //             }
        //             await t.afterCommit(async (transaction) =>{
        //                 const transactionEnd = await sequelize.transaction();

        //                 try {
        //                     const formattedData = await Promise.all(data.map( async toko => {
        //                         let remainingTime = 0;
        //                         const now = new Date();
                               
        //                         const tokoData = toko.dataValues;
        //                         const hotelData = tokoData.hotels[0]? tokoData.hotels[0].dataValues : null;
        //                         const groomingData = tokoData.groomings[0]? tokoData.groomings[0].dataValues : null;
        //                         const orderData = hotelData ? hotelData.detail_order_hotel[0].orders.dataValues : groomingData.detail_order_grooming[0].orders.dataValues;
                                
        //                         //tanggal_order
        //                         const orderDate = orderData.tanggal_order;
        //                         const diffInMilliseconds = now - orderDate; // Difference in milliseconds
        //                         let minutes = 0;
        //                         let seconds = 0
        //                         if (diffInMilliseconds < 15 * 60 * 1000) { // If less than 15 minutes
        //                             const diffInSeconds = Math.floor(diffInMilliseconds / 1000); // Convert to seconds
        //                             const remainingMilliseconds = 15 * 60 * 1000 - diffInMilliseconds;
        //                             const remainingSeconds = Math.floor(remainingMilliseconds / 1000); // Convert to seconds
        //                             minutes = Math.floor(remainingSeconds / 60);
        //                             seconds = remainingSeconds % 60;
        //                             remainingTime = `${minutes} minutes ${seconds} seconds`;
        //                         }
                    
        //                         if(minutes === 0 && seconds === 0){
        //                             await Order.update({
        //                                 status_order: 'Expired'
        //                             }, 
        //                             {
        //                                 where:{
        //                                     id: value.orderId
        //                                 }
        //                             })
        //                         }
                    
        //                         const userData = orderData.users.dataValues;
        //                         const reviewData = orderData.reviews ? orderData.reviews.dataValues : null ;
                                
        //                         if(hotelData !== null){
        //                             if(reviewData !== null){
        //                                 return {
        //                                     id_toko: tokoData.id_toko,
        //                                     nama_toko: tokoData.pet_shop_name,
        //                                     user_id: userData.user_id,
        //                                     order_id: orderData.order_id,
        //                                     // status_order: orderData.status_order,
        //                                     metode_pembayaran: orderData.metode_pembayaran,
        //                                     // remaining_time: remainingTime,
        //                                     time:{
        //                                         minutes: minutes,
        //                                         seconds: seconds
        //                                     },
        //                                     // total_price: orderData.total_price,
        //                                     virtual_number: orderData.virtual_number,
        //                                     order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
        //                                     tanggal_order: orderData.tanggal_order,
        //                                     updatedAt: orderData.updatedAt,
        //                                     createdAt: orderData.createdAt,
        //                                     deletedAt: orderData.deletedAt,
        //                                     order_detail: tokoData.hotels.map(hotel => {
        //                                         const hotelData = hotel.dataValues;
        //                                         totalPrice += hotelData.harga * hotelData.detail_order_hotel[0].dataValues.quantity
        //                                         return {
        //                                             hotel_id: hotelData.id,
        //                                             hotel_title: hotelData.title_hotel,
        //                                             quantity: hotelData.detail_order_hotel[0].dataValues.quantity
        //                                         };
        //                                     }),
        //                                     total_price: totalPrice, 
        //                                     review: {
        //                                         rate: reviewData.review,
        //                                         review_description: reviewData.review_description
        //                                     },
        //                                     service_type: "Hotel"
        //                                 };
        //                             } else {
        //                                 return {
        //                                     id_toko: tokoData.id_toko,
        //                                     nama_toko: tokoData.pet_shop_name,
        //                                     user_id: userData.user_id,
        //                                     order_id: orderData.order_id,
        //                                     order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
        //                                     metode_pembayaran: orderData.metode_pembayaran,
        //                                     // remaining_time: remainingTime,
        //                                     time:{
        //                                         minutes: minutes,
        //                                         seconds: seconds
        //                                     },
        //                                     // total_price: orderData.total_price,
        //                                     virtual_number: orderData.virtual_number,
        //                                     // status_order: orderData.status_order,
        //                                     tanggal_order: orderData.tanggal_order,
        //                                     updatedAt: orderData.updatedAt,
        //                                     createdAt: orderData.createdAt,
        //                                     deletedAt: orderData.deletedAt,
        //                                     order_detail: tokoData.hotels.map(hotel => {
        //                                         const hotelData = hotel.dataValues;
        //                                         totalPrice += hotelData.harga * hotelData.detail_order_hotel[0].dataValues.quantity
        //                                         return {
        //                                             hotel_id: hotelData.id,
        //                                             hotel_title: hotelData.title_hotel,
        //                                             quantity: hotelData.detail_order_hotel[0].dataValues.quantity
        //                                         };
        //                                     }),
        //                                     total_price: totalPrice, 
        //                                     review: null,
        //                                     service_type: "Hotel"
        //                                 };
        //                             }
        //                         } else if (groomingData !== null){
        //                             if(reviewData !== null){
        //                                 return {
        //                                     id_toko: tokoData.id_toko,
        //                                     nama_toko: tokoData.pet_shop_name,
        //                                     user_id: userData.user_id,
        //                                     order_id: orderData.order_id,
        //                                     order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
        //                                     metode_pembayaran: orderData.metode_pembayaran,
        //                                     // remaining_time: remainingTime,
        //                                     time:{
        //                                         minutes: minutes,
        //                                         seconds: seconds
        //                                     },
        //                                     // total_price: orderData.total_price,
        //                                     virtual_number: orderData.virtual_number,
        //                                     // status_order: orderData.status_order,
        //                                     tanggal_order: orderData.tanggal_order,
        //                                     updatedAt: orderData.updatedAt,
        //                                     createdAt: orderData.createdAt,
        //                                     deletedAt: orderData.deletedAt,
        //                                     order_detail: tokoData.groomings.map(grooming => {
        //                                         const groomingData = grooming.dataValues;
        //                                         totalPrice += groomingData.harga * groomingData.detail_order_grooming[0].dataValues.quantity
        //                                         return {
        //                                             grooming_id: groomingData.id,
        //                                             grooming_title: groomingData.title_grooming,
        //                                             quantity: groomingData.detail_order_grooming[0].dataValues.quantity
        //                                         };
        //                                     }),
        //                                     total_price: totalPrice, 
        //                                     review: {
        //                                         rate: reviewData.review,
        //                                         review_description: reviewData.ulasan
        //                                     },
        //                                     service_type: "Grooming"
        //                                 };
        //                             } else {
        //                                 return {
        //                                     id_toko: tokoData.id_toko,
        //                                     nama_toko: tokoData.pet_shop_name,
        //                                     user_id: userData.user_id,
        //                                     order_id: orderData.order_id,
        //                                     order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
        //                                     metode_pembayaran: orderData.metode_pembayaran,
        //                                     // remaining_time: remainingTime,
        //                                     time:{
        //                                         minutes: minutes,
        //                                         seconds: seconds
        //                                     },
        //                                     // total_price: orderData.total_price,
        //                                     virtual_number: orderData.virtual_number,
        //                                     // status_order: orderData.status_order,
        //                                     tanggal_order: orderData.tanggal_order,
        //                                     updatedAt: orderData.updatedAt,
        //                                     createdAt: orderData.createdAt,
        //                                     deletedAt: orderData.deletedAt,
        //                                     order_detail: tokoData.groomings.map(grooming => {
        //                                         const groomingData = grooming.dataValues;
        //                                         totalPrice += groomingData.harga * groomingData.detail_order_grooming[0].dataValues.quantity
        //                                         return {
        //                                             grooming_id: groomingData.id,
        //                                             grooming_title: groomingData.title_grooming,
        //                                             quantity: groomingData.detail_order_grooming[0].dataValues.quantity,
        //                                         };
        //                                     }),
        //                                     total_price: totalPrice, 
        //                                     review: null,
        //                                     service_type: "Grooming"
        //                                 };
        //                             }
        //                         }
        //                     }));
                            
        //                     // console.log(formattedData);
        //                     return res.status(200).json({
        //                         message: "Data detail order berhasil diambil",
        //                         response_code: 200,
        //                         data: formattedData
        //                     })
        //                 } catch (error) {
        //                     await transactionEnd.rollback()
        //                     throw new Error('Internal server error')
        //                 }
        //             })
        //         }).catch(async (e) => {
        //             console.log('Error occured:', e.message);
        //             if(e.message.includes('HTTP status code: 404')){
        //                 await t.rollback(); // Rollback the transaction here
        //                 // return res.status(200).json({
        //                 //     message: "Order ID Not Found"
        //                 // })
        //             }
        //         });
        //     } catch (error) {
        //         console.log(error.message)
        //         await t.rollback() // Rollback the transaction in case of an error
        //     }
        // })

        const formattedData = await Promise.all(data.map( async toko => {

             
            
            let remainingTime = 0;
            const now = new Date();
           
            const tokoData = toko.dataValues;
            const hotelData = tokoData.hotels[0]? tokoData.hotels[0].dataValues : null;
            const groomingData = tokoData.groomings[0]? tokoData.groomings[0].dataValues : null;
            const orderData = hotelData ? hotelData.detail_order_hotel[0].orders.dataValues : groomingData.detail_order_grooming[0].orders.dataValues;

            // CHECK STATUS TRANS
            let coreApi = new midtransClient.CoreApi({
                isProduction: false,
                serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
            });
            let transactionStatus;
            try {
                transactionStatus = await coreApi.transaction.status(value.orderId);
            } catch (error) {
                console.error(`Error getting transaction status: ${error}`);
            }

            console.log(transactionStatus)

            // Check if transaction is expired
            if (transactionStatus.transaction_status === 'expire' && orderData.status_order !== 'Cancel') {
                // Update order_status in database
                await Order.update({
                    status_pembayaran: "Expired",
                    status_order: 'Expired'
                }, 
                {
                    where:{
                        id: value.orderId
                    }
                });
            } else if(transactionStatus.transaction_status === 'settlement'){
                await Order.update({
                    status_pembayaran: "Berhasil",
                    status_order: "On Progress"
                }, 
                {
                    where:{
                        id: value.orderId
                    }
                });
            }
            //tanggal_order
            const orderDate = orderData.tanggal_order;
            const diffInMilliseconds = now - orderDate; // Difference in milliseconds
            let minutes = 0;
            let seconds = 0
            if (diffInMilliseconds < 15 * 60 * 1000) { // If less than 15 minutes
                const diffInSeconds = Math.floor(diffInMilliseconds / 1000); // Convert to seconds
                const remainingMilliseconds = 15 * 60 * 1000 - diffInMilliseconds;
                const remainingSeconds = Math.floor(remainingMilliseconds / 1000); // Convert to seconds
                minutes = Math.floor(remainingSeconds / 60);
                seconds = remainingSeconds % 60;
                remainingTime = `${minutes} minutes ${seconds} seconds`;
            }

            if(minutes === 0 && seconds === 0 && orderData.status_order !== 'Cancel'){
                await Order.update({
                    status_order: 'Expired'
                }, 
                {
                    where:{
                        id: value.orderId
                    }
                })
            }

            const userData = orderData.users.dataValues;
            const reviewData = orderData.reviews ? orderData.reviews.dataValues : null ;
            
            if(hotelData !== null){
                if(reviewData !== null){
                    return {
                        id_toko: tokoData.id_toko,
                        nama_toko: tokoData.pet_shop_name,
                        user_id: userData.user_id,
                        order_id: orderData.order_id,
                        // status_order: orderData.status_order,
                        metode_pembayaran: orderData.metode_pembayaran,
                        // remaining_time: remainingTime,
                        time:{
                            minutes: minutes,
                            seconds: seconds
                        },
                        // total_price: orderData.total_price,
                        virtual_number: orderData.virtual_number,
                        order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
                        tanggal_order: orderData.tanggal_order,
                        updatedAt: orderData.updatedAt,
                        createdAt: orderData.createdAt,
                        deletedAt: orderData.deletedAt,
                        order_detail: tokoData.hotels.map(hotel => {
                            const hotelData = hotel.dataValues;
                            totalPrice += hotelData.harga * hotelData.detail_order_hotel[0].dataValues.quantity
                            return {
                                hotel_id: hotelData.id,
                                hotel_title: hotelData.title_hotel,
                                quantity: hotelData.detail_order_hotel[0].dataValues.quantity
                            };
                        }),
                        total_price: totalPrice, 
                        review: {
                            rate: reviewData.review,
                            review_description: reviewData.review_description
                        },
                        service_type: "Hotel"
                    };
                } else {
                    return {
                        id_toko: tokoData.id_toko,
                        nama_toko: tokoData.pet_shop_name,
                        user_id: userData.user_id,
                        order_id: orderData.order_id,
                        order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
                        metode_pembayaran: orderData.metode_pembayaran,
                        // remaining_time: remainingTime,
                        time:{
                            minutes: minutes,
                            seconds: seconds
                        },
                        // total_price: orderData.total_price,
                        virtual_number: orderData.virtual_number,
                        // status_order: orderData.status_order,
                        tanggal_order: orderData.tanggal_order,
                        updatedAt: orderData.updatedAt,
                        createdAt: orderData.createdAt,
                        deletedAt: orderData.deletedAt,
                        order_detail: tokoData.hotels.map(hotel => {
                            const hotelData = hotel.dataValues;
                            totalPrice += hotelData.harga * hotelData.detail_order_hotel[0].dataValues.quantity
                            return {
                                hotel_id: hotelData.id,
                                hotel_title: hotelData.title_hotel,
                                quantity: hotelData.detail_order_hotel[0].dataValues.quantity
                            };
                        }),
                        total_price: totalPrice, 
                        review: null,
                        service_type: "Hotel"
                    };
                }
            } else if (groomingData !== null){
                if(reviewData !== null){
                    return {
                        id_toko: tokoData.id_toko,
                        nama_toko: tokoData.pet_shop_name,
                        user_id: userData.user_id,
                        order_id: orderData.order_id,
                        order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
                        metode_pembayaran: orderData.metode_pembayaran,
                        // remaining_time: remainingTime,
                        time:{
                            minutes: minutes,
                            seconds: seconds
                        },
                        // total_price: orderData.total_price,
                        virtual_number: orderData.virtual_number,
                        // status_order: orderData.status_order,
                        tanggal_order: orderData.tanggal_order,
                        updatedAt: orderData.updatedAt,
                        createdAt: orderData.createdAt,
                        deletedAt: orderData.deletedAt,
                        order_detail: tokoData.groomings.map(grooming => {
                            const groomingData = grooming.dataValues;
                            totalPrice += groomingData.harga * groomingData.detail_order_grooming[0].dataValues.quantity
                            return {
                                grooming_id: groomingData.id,
                                grooming_title: groomingData.title_grooming,
                                quantity: groomingData.detail_order_grooming[0].dataValues.quantity
                            };
                        }),
                        total_price: totalPrice, 
                        review: {
                            rate: reviewData.review,
                            review_description: reviewData.ulasan
                        },
                        service_type: "Grooming"
                    };
                } else {
                    return {
                        id_toko: tokoData.id_toko,
                        nama_toko: tokoData.pet_shop_name,
                        user_id: userData.user_id,
                        order_id: orderData.order_id,
                        order_status: minutes === 0 && seconds === 0 ? 'Expired' : orderData.status_order,
                        metode_pembayaran: orderData.metode_pembayaran,
                        // remaining_time: remainingTime,
                        time:{
                            minutes: minutes,
                            seconds: seconds
                        },
                        // total_price: orderData.total_price,
                        virtual_number: orderData.virtual_number,
                        // status_order: orderData.status_order,
                        tanggal_order: orderData.tanggal_order,
                        updatedAt: orderData.updatedAt,
                        createdAt: orderData.createdAt,
                        deletedAt: orderData.deletedAt,
                        order_detail: tokoData.groomings.map(grooming => {
                            const groomingData = grooming.dataValues;
                            totalPrice += groomingData.harga * groomingData.detail_order_grooming[0].dataValues.quantity
                            return {
                                grooming_id: groomingData.id,
                                grooming_title: groomingData.title_grooming,
                                quantity: groomingData.detail_order_grooming[0].dataValues.quantity,
                            };
                        }),
                        total_price: totalPrice, 
                        review: null,
                        service_type: "Grooming"
                    };
                }
            }
        }));
        
        // console.log(formattedData);
        return res.status(200).json({
            message: "Data detail order berhasil diambil",
            response_code: 200,
            data: formattedData
        })
    } catch(e) {
        console.log(e.message)
        return res.status(500).json({
            message: e.message
        })
    }
}

const getOrderStatusWaitingPayment = async (req, res) => {

    try {

        // await sequelize.transaction(async (t) => {
        //     try {
        //         let coreApi = new midtransClient.CoreApi({
        //             isProduction: false,
        //             serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
        //             clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        //         });
        
        //         const allOrders = await Order.findAll();
        
        //         for (let order of allOrders) {
        //             let orderId = order.id;
        
        //             try {
        //                 const response = await coreApi.transaction.status(orderId);
        //                 console.log('Transaction status:', response.transaction_status);
        
        //                 if (response.transaction_status === 'settlement') {
        //                     console.log('Transaction is successful');
        
        //                     const updateStatusPayment = await Order.update(
        //                         { 
        //                             status_pembayaran: "Berhasil",
        //                             status_order: "On Progress"
        //                         },
        //                         { 
        //                             transaction: t,
        //                             where: {id: orderId} 
        //                         }
        //                     );
        //                 } else if(response.transaction_status === 'expire'){
        //                     console.log('Transaction is expired');
        
        //                     const updateStatusPayment = await Order.update(
        //                         { 
        //                             status_pembayaran: "Expired",
        //                             status_order: "Expired"
        //                         },
        //                         { 
        //                             transaction: t,
        //                             where: {id: orderId} 
        //                         }
        //                     );
        //                 } else {
        //                     console.log('Transaction is not successful');
        //                 }
        //             } catch (e) {
        //                 console.log('Error occured:', e.message);
        //             }
        //         }
        //     } catch (error) {
        //         await t.rollback();
        //     }
        // });
            
                
        const data = await Toko.findAll({
            attributes: [
                ['nama', 'title'],
            ],
            include: [
                {
                    model: Hotel,
                    as: 'hotels',
                    attributes: ['harga'],                    
                    required: false,
                    include: [
                        {
                            model: DetailOrderHotel,
                            as: 'detail_order_hotel',
                            attributes: ['quantity'],
                            required: true,
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order'],
                                where: {
                                    status_order:{
                                        [Op.iLike] : '%Waiting Payment%'
                                    }
                                },
                            }]
                        },
                    ]
                },
                {
                    model: Grooming,
                    as: 'groomings',
                    attributes: ['harga'],                    
                    required: false,
                    include: [
                        {
                            model: DetailOrderGrooming,
                            as: 'detail_order_grooming',
                            attributes: ['quantity'],
                            required: true,
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order'],
                                where: {
                                    status_order:{
                                        [Op.iLike] : '%Waiting Payment%'
                                    }
                                },
                            }]
                        },
                    ]
                }
            ]
        })

        // console.log(data)

        if(!data){
            return res.status(404).json({
                "response_code": 404,
                "message": "Data not found"
            })
        }


        const formattedData = [];

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        let coreApi = new midtransClient.CoreApi({
                            isProduction: false,
                            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
                        });
                        let transactionStatus;
                        try {
                            transactionStatus = await coreApi.transaction.status(order.orders.dataValues.order_id);
                        } catch (error) {
                            console.error(`Error getting transaction status: ${error}`);
                        }

                        console.log(transactionStatus)
                        console.log(order.orders.dataValues.order_id)

                        if (transactionStatus.transaction_status === 'expire') {
                            await Order.update({
                                status_pembayaran: "Expired",
                                status_order: 'Expired'
                            }, 
                            {
                                where:{
                                    id: order.orders.dataValues.order_id
                                }
                            });
                        } else if(transactionStatus.transaction_status === 'settlement'){
                            await Order.update({
                                status_pembayaran: "Expired",
                                status_order: "On Progress"
                            }, 
                            {
                                where:{
                                    id: order.orders.dataValues.order_id
                                }
                            });
                        }
                        formattedData.push({
                            order_id: order.orders.dataValues.order_id,
                            title: toko.dataValues.title,
                            status: order.orders.status_order,
                            total_payment: service.harga * order.quantity
                        });
                    }
                }
            }

            // console.log(formattedData)

        return res.status(200).json({
            message: "Data Ditemukan",
            response_code: 200,
            data: formattedData

        })
    

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    createOrder,
    getPaymentData,
    checkPaymentStatus,
    setPaymentToExpired,
    getDetailOrder,
    getOrderStatusWaitingPayment
}