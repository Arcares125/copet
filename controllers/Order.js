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
    Review, 
    Chat} = require("../models")
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

        const getUserUid = await User.findOne({
            attributes: ['uid'],
            where:{
                id: data.user_id
            }
        })

        await dataOrder.update({
            status: "Waiting Payment"
        }, {
            where: {
                order_id: dataOrder.dataValues.id
            }
        })

        let getDayStay;
        let totalDayStay;
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
                    tanggal_grooming: data.tanggal_masuk,
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

            if (new Date(data.tanggal_masuk).getTime() > new Date(data.tanggal_keluar).getTime()) {
                return res.status(200).json({
                    response_code: 200,
                    message: "Tanggal Check in tidak bisa lebih besar dari Tanggal Check out"
                })
            }

            getDayStay = (new Date(data.tanggal_keluar).getTime()) - (new Date(data.tanggal_masuk).getTime())
  
            //calculate days difference by dividing total milliseconds in a day  
            totalDayStay = getDayStay / (1000 * 60 * 60 * 24);

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
                "order_id": "NNN-"+dataOrder.dataValues.id,
                "gross_amount": data.service_type === 'Hotel' || data.service_type === 'hotel' ? totalPrice * totalDayStay : totalPrice
            },
            "custom_expiry":
            {   
                // "order_time":  dataOrder.dataValues.tanggal_order,
                "expiry_duration": 3,
                "unit": "minute"
            },
            "bank_transfer": {
                "bank": "bca"
            },
            "name_payment": "BCA Virtual Account"
        };

        const chargeAndHandleError = async (retryCount = 3) => {
            try {
                // console.log(retryCount)
                const chargeResponse = await coreApi.charge(parameter);
                const nama = parameter.name_payment;
                let kode = chargeResponse.va_numbers[0].va_number;

                const updateVaOrder = await Order.update(
                    { 
                        virtual_number: kode,
                    },
                    { where: {id: dataOrder.dataValues.id} }
                );
                
                const createChat = await Chat.create({
                    uid: getUserUid.dataValues.uid,
                    order_id: dataOrder.dataValues.id,
                    status: "Waiting Payment"
                })

                setTimeout(async () => {
                    const currOrder = await Order.findOne({ where: { id: dataOrder.dataValues.id } });
                    const transactionStatusResponse = await coreApi.transaction.status(dataOrder.dataValues.id);
                    const latestTransaction = transactionStatusResponse.transaction_status
                    if (currOrder && latestTransaction === 'pending') {
                        await Order.update(
                            { status_order: 'Expired' },
                            { where: { id: dataOrder.dataValues.id } }
                        );

                        await Chat.update({
                            status: 'Expired'
                        }, {
                            where: {
                                order_id: dataOrder.dataValues.id
                            }
                        })
                        console.log(`Order ${dataOrder.dataValues.id} is now expired.`);
                    }
                }, 3 * 60 * 1000);  // 3 minutes

                return res.status(200).json({
                    response_code: 200,
                    message: "Data Order Berhasil Disimpan",
                    data: {
                        order: {...dataOrder.dataValues, virtual_number: kode},
                        detail: details,
                        total_price: totalPrice*totalDayStay,
                        nama,
                        kode,
                        'transactionStatus': chargeResponse.transaction_status, 
                        'fraudStatus': chargeResponse.fraud_status
                    }
                });
            } catch (e) {
                console.log('Error occured:', e.message);
                if (e.message.includes('HTTP status code: 406')) {
                    return res.status(200).json({
                        message: "Order ID has been used, try another order ID"
                    });
                } else if (e.message.includes('HTTP status code: 505')) {
                    if (retryCount > 0) {
                        console.log(`Retry attempt number: ${4 - retryCount}`);
                        return chargeAndHandleError(retryCount - 1);
                    } else {
                        return res.status(200).json({
                            message: "Unable to create va_number for this transaction"
                        });
                    }
                }
            }
        };

        chargeAndHandleError();
        
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
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
            response_code: 500,
            message: error.message,
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

                await Chat.update({
                    status: 'On Progress'
                }, {
                    where: {
                        order_id: orderId
                    }
                })

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

                await Chat.update({
                    status: 'Expired'
                }, {
                    where: {
                        order_id: orderId
                    }
                })

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
                return res.status(404).json({
                    response_code: 404,
                    message: "Order ID Not Found"
                })
            }
        });

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
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
        // console.log(orderIsValid)

        if(!orderIsValid){
            return res.status(404).json({
                "response_code": 404,
                "message": "Order not found"
            })
        }
        // console.log("NNN-"+orderId)
        let transactionStatus;
        let retries = 3;
                
        while(retries > 0){
            // console.log(retries)
            try {
                transactionStatus = await coreApi.transaction.status(`NNN-${orderId}`);
                break;
                // console.log(transactionStatus)
            } catch (error) {
                retries--;
                if(retries === 0){
                    throw error;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                } 
            }
        }

        if (transactionStatus.transaction_status === 'expire') {
            return res.status(200).json({
                "response_code": 200,
                "message": "Transaction is already expired"
            })
        } else {
            const updateStatusPayment = await Order.update(
                { 
                    status_pembayaran: "Expired",
                    status_order: "Cancel"
                },
                { where: {id: orderId} }
            )

            await Chat.update({
                status: 'Cancel'
            }, {
                where: {
                    order_id: orderId
                }
            })

            return res.status(200).json({
                "response_code": 200,
                "Transaction Status": "Expired"
            })
        }
        // transactionStatus = await coreApi.transaction.status("NNN-"+value.orderId);
        
        // coreApi.transaction.status("NNN-"+orderId).then(async (response) => {
        //     console.log('Transaction status:', response.transaction_status);
        
        //     if(response.transaction_status === 'expire') {
        //         return res.status(200).json({
        //             "response_code": 200,
        //             "message": "Transaction is already expired"
        //         })
        //     } else {
        //         return coreApi.transaction.expire(orderId).then(async (response) => {
        //             console.log('Transaction status after expire:', response.transaction_status);
        
        //             const updateStatusPayment = await Order.update(
        //                 { 
        //                     status_pembayaran: "Expired",
        //                     status_order: "Cancel"
        //                 },
        //                 { where: {id: orderId} }
        //             )
        
        //             return res.status(200).json({
        //                 "response_code": 200,
        //                 "Transaction Status": "Expired"
        //             })
        //         }).catch((e) => {
        //             console.log('Error occured:', e.message);
        //         });
        //     }
        // }).catch((e) => {
        //     console.log('Error occured:', e.message);
        //     if(e.message.includes('HTTP status code: 404')){
        //         return res.status(200).json({
        //             message: "Order ID Not Found"
        //         })
        //     } else if(e.message.includes('HTTP status code: 500')){
        //         return res.status(500).json({
        //             message: "Sorry. Our system is recovering from unexpected issues. Please retry."
        //         })
        //     } else if(e.message.includes('HTTP status code: 412')){
        //         return res.status(500).json({
        //             message: "Transaction status cannot be updated."
        //         })
        //         // Error occured: Midtrans API is returning API error. HTTP status code: 412. 
        //         // API response: {"status_code":"412","status_message":"Transaction status cannot be updated.",
        //         // "id":"44be8d42-472d-44cb-963b-70bf7216241a"}
        //     }
        // });

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const setOrderToCompleted = async (req, res) => {

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
        // console.log(orderIsValid)

        if(!orderIsValid){
            return res.status(404).json({
                "response_code": 404,
                "message": "Order not found"
            })
        }
        
        const updateOrderStatus = await Order.update(
            { 
                status_order: "Completed"
            },
            { where: {id: orderId} }
        )

        await Chat.update({
            status: 'Completed'
        }, {
            where: {
                order_id: orderId
            }
        })

        return res.status(200).json({
            "response_code": 200,
            "message": "order has been completed",
            data: {...orderIsValid.dataValues, status_order: "Completed"}
        })

    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const getDetailOrder = async (req, res) => {

    const value = req.params

    try {

        const userIsValid = await User.findOne({
            where: {
                id: value.userId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '400',
                message: 'User not found'
            })
        }

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
                            attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
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
                                        attributes: [['id', 'user_id'], 'uid']
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
                                        attributes: [['id', 'user_id'], 'uid']
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
                // 
                {
                    model: PenyediaJasa,
                    as: 'role_toko',
                    attributes: ['uid']
                }
            ],
            where: {
                id: {
                  [Op.in]: sequelize.literal(`(SELECT a.toko_id FROM hotel a INNER JOIN detail_order_hotel b ON a.id = b.hotel_id 
                    WHERE b.order_id = ${value.orderId}
                    UNION 
                    SELECT c.toko_id FROM grooming c INNER JOIN detail_order_grooming d ON c.id = d.grooming_id
                    WHERE d.order_id = ${value.orderId})`)
                }
              },
        });

        let totalPrice = 0;
        // console.log(data)
        // console.log(value.orderId)

        const formattedData = await Promise.all(data.map(async toko => {  
            // console.log(toko)
            
            let remainingTime = 0;
            const now = new Date();
           
            const tokoData = toko?.dataValues;
            // if(tokoData.groomings.length === 0 && tokoData.hotels.length === 0){
                
            // } else {
                const hotelData = tokoData.hotels[0]? tokoData.hotels[0]?.dataValues : null;
                const groomingData = tokoData.groomings[0]? tokoData.groomings[0]?.dataValues : null;
                const orderData = hotelData ? hotelData.detail_order_hotel[0].orders?.dataValues : groomingData.detail_order_grooming[0].orders?.dataValues;

                let differenceInMilliseconds
                let differenceInDays
                if(hotelData){
                    // Calculate the difference in milliseconds
                    differenceInMilliseconds = hotelData ? hotelData.detail_order_hotel[0]?.dataValues.tanggal_keluar.getTime() - hotelData.detail_order_hotel[0]?.dataValues.tanggal_masuk.getTime():''

                    // Convert the difference to days
                    differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                    console.log(`The difference between the two dates is ${differenceInDays} days.`);
                }

                // CHECK STATUS TRANS
                let coreApi = new midtransClient.CoreApi({
                    isProduction: false,
                    serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                    clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
                });
                let transactionStatus;
                let retries = 3;
                
                while(retries > 0){
                    // console.log(retries)
                    try {
                        transactionStatus = await coreApi.transaction.status(`NNN-${value.orderId}`);
                        break;
                        // console.log(transactionStatus)
                    } catch (error) {
                        retries--;
                        if(retries === 0){
                            throw error;
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                        } 
                       
                        // if (error.ApiResponse && error.ApiResponse.status_code === 500) {
                        //     console.error('Midtrans Server error, status code: 500');
                        
                        // } else if(transactionStatus === undefined){
                        //     console.error(`Error getting transaction status: ${error}`);
    
                        //     // return res.json({
                        //     //     "response_code": 200,
                        //     //     "message": "No Data Available"
                        //     // })
                        // } else {
                        //     console.error(`Error getting transaction status: ${error}`);       
                        // }
                    }
                }
                
                // Check if transaction is expired
                if (transactionStatus.transaction_status === 'expire' && orderData.status_order === 'Waiting Payment') {
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

                    await Chat.update({
                        status: 'Expired'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })
                } else if(transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment'){
                    await Order.update({
                        status_pembayaran: "Berhasil",
                        status_order: "On Progress"
                    }, 
                    {
                        where:{
                            id: value.orderId
                        }
                    });

                    await Chat.update({
                        status: 'On Progress'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })

                } else if(transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Completed'){
                    await Order.update({
                        status_pembayaran: "Berhasil",
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
                if (diffInMilliseconds < 3 * 60 * 1000) { // If less than 15 minutes
                    const diffInSeconds = Math.floor(diffInMilliseconds / 1000); // Convert to seconds
                    const remainingMilliseconds = 3 * 60 * 1000 - diffInMilliseconds;
                    const remainingSeconds = Math.floor(remainingMilliseconds / 1000); // Convert to seconds
                    minutes = Math.floor(remainingSeconds / 60);
                    seconds = remainingSeconds % 60;
                    remainingTime = `${minutes} minutes ${seconds} seconds`;
                }

                if(orderData.status_order === 'Cancel' || orderData.status_order === 'On Progress' || transactionStatus.transaction_status === 'settlement'){
                    minutes = 0;
                    seconds = 0;
                }

                if(minutes === 0 && seconds === 0 && orderData.status_order !== 'Cancel' && orderData.status_order !== 'On Progress' && orderData.status_order !== 'Completed' && transactionStatus.transaction_status === 'expire'){
                    await Order.update({
                        status_order: 'Expired'
                    }, 
                    {
                        where:{
                            id: value.orderId
                        }
                    })

                    await Chat.update({
                        status: 'Expired'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })
                }

                const userData = orderData.users?.dataValues;
                const reviewData = orderData.reviews ? orderData.reviews?.dataValues : null ;
                // console.log(orderData)
                if(hotelData !== null){
                    if(reviewData !== null){
                        return {
                            id_toko: tokoData.id_toko,
                            nama_toko: tokoData.pet_shop_name,
                            user_id: userData.user_id,
                            uid: tokoData.role_toko.dataValues.uid,
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
                            check_in: hotelData.detail_order_hotel[0].dataValues.tanggal_masuk,
                            check_out: hotelData.detail_order_hotel[0].dataValues.tanggal_keluar,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
                            tanggal_order: orderData.tanggal_order,
                            updatedAt: orderData.updatedAt,
                            createdAt: orderData.createdAt,
                            deletedAt: orderData.deletedAt,
                            order_detail: tokoData.hotels.map(hotel => {
                                const hotelData = hotel?.dataValues;
                                totalPrice += hotelData.harga * hotelData.detail_order_hotel[0]?.dataValues.quantity * differenceInDays
                                return {
                                    hotel_id: hotelData.id,
                                    hotel_title: hotelData.title_hotel,
                                    quantity: hotelData.detail_order_hotel[0]?.dataValues.quantity,
                                    price: hotelData.harga
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
                            uid: tokoData.role_toko.dataValues.uid,
                            user_id: userData.user_id,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
                            metode_pembayaran: orderData.metode_pembayaran,
                            // remaining_time: remainingTime,
                            time:{
                                minutes: minutes,
                                seconds: seconds
                            },
                            // total_price: orderData.total_price,
                            virtual_number: orderData.virtual_number,
                            check_in: hotelData.detail_order_hotel[0].dataValues.tanggal_masuk,
                            check_out: hotelData.detail_order_hotel[0].dataValues.tanggal_keluar,
                            // status_order: orderData.status_order,
                            tanggal_order: orderData.tanggal_order,
                            updatedAt: orderData.updatedAt,
                            createdAt: orderData.createdAt,
                            deletedAt: orderData.deletedAt,
                            order_detail: tokoData.hotels.map(hotel => {
                                const hotelData = hotel?.dataValues;
                                totalPrice += hotelData.harga * hotelData.detail_order_hotel[0]?.dataValues.quantity * differenceInDays
                                return {
                                    hotel_id: hotelData.id,
                                    hotel_title: hotelData.title_hotel,
                                    quantity: hotelData.detail_order_hotel[0]?.dataValues.quantity,
                                    price: hotelData.harga
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
                            uid: tokoData.role_toko.dataValues.uid,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
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
                                const groomingData = grooming?.dataValues;
                                totalPrice += groomingData.harga * groomingData.detail_order_grooming[0]?.dataValues.quantity
                                return {
                                    grooming_id: groomingData.id,
                                    grooming_title: groomingData.title_grooming,
                                    quantity: groomingData.detail_order_grooming[0]?.dataValues.quantity,
                                    price: groomingData.harga
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
                            uid: tokoData.role_toko.dataValues.uid,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
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
                                const groomingData = grooming?.dataValues;
                                totalPrice += groomingData.harga * groomingData.detail_order_grooming[0]?.dataValues.quantity
                                return {
                                    grooming_id: groomingData.id,
                                    grooming_title: groomingData.title_grooming,
                                    quantity: groomingData.detail_order_grooming[0]?.dataValues.quantity,
                                    price: groomingData.harga
                                };
                            }),
                            total_price: totalPrice, 
                            review: null,
                            service_type: "Grooming"
                        };
                    }
                // }
            }
        }));
        
        return res.status(200).json({
            response_code: 200,
            message: "Data detail order berhasil diambil",
            // data: formattedData.filter(item => item !== null)
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

    const value = req.params
    try {

        const userIsValid = await User.findOne({
            where: {
                id: value.userId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'User not found'
            })
        }

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
                            attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                            required: true,
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order'],
                                where: {
                                    [Op.and]: [
                                        { status_order: {[Op.iLike] : '%Waiting Payment%'} },
                                        { user_id: value.userId }
                                      ]
                                    // status_order:{
                                    //     [Op.iLike] : '%Waiting Payment%'
                                    // },
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
                                    [Op.and]: [
                                        { status_order: {[Op.iLike] : '%Waiting Payment%'} },
                                        { user_id: value.userId }
                                      ]
                                    // status_order:{
                                    //     [Op.iLike] : '%Waiting Payment%'
                                    // },
                                },
                            }]
                        },
                    ]
                }
            ], logging:false
        },)

        if(!data){
            return res.status(404).json({
                "response_code": 404,
                "message": "Data not found"
            })
        }

        const formattedData = [];
        let orderIdValid = true;

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        // console.log(order)
                        // console.log(order.dataValues.orders.dataValues.status_order !== 'Cancel')
                        // console.log(order.dataValues.orders.dataValues.order_id)
                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        let coreApi = new midtransClient.CoreApi({
                            isProduction: false,
                            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
                        });
                        let transactionStatus;
                        let retries = 3;
                
                        while(retries > 0){
                            // console.log(retries)
                            try {
                                transactionStatus = await coreApi.transaction.status(`NNN-${order.orders.dataValues.order_id}`);
                                break;
                                // console.log(transactionStatus)
                            } catch (error) {
                                if(error.httpStatusCode === '404'){
                                    orderIdValid = false
                                    break;
                                }
                                retries--;
                                if(retries === 0){
                                    throw error;
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                                } 
                            }
                        }

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            
                            if (transactionStatus.transaction_status === 'expire' && order.dataValues.orders.dataValues.status_order !== 'Cancel' && order.dataValues.orders.dataValues.status_order !== 'On Progress') {
                                await Order.update({
                                    status_pembayaran: "Expired",
                                    status_order: 'Expired'
                                }, 
                                {
                                    where:{
                                        id: order.orders.dataValues.order_id
                                    }
                                });

                                await Chat.update({
                                    status: 'Expired'
                                }, {
                                    where: {
                                        order_id: order.orders.dataValues.order_id
                                    }
                                })
                            } else if(transactionStatus.transaction_status === 'settlement'){
                                await Order.update({
                                    status_pembayaran: "Berhasil",
                                    status_order: "On Progress"
                                }, 
                                {
                                    where:{
                                        id: order.orders.dataValues.order_id
                                    }
                                });

                                await Chat.update({
                                    status: 'On Progress'
                                }, {
                                    where: {
                                        order_id: order.orders.dataValues.order_id
                                    }
                                })
                            }

                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    title: toko.dataValues.title,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }
                    }
                }
            }

        return res.status(200).json({
            response_code: 200,
            message: "Data Ditemukan",
            data: formattedData.sort((a, b) => b.order_id - a.order_id)

        })
    

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const getOrderStatusOnProgress = async (req, res) => {

    const value = req.params
    let orderIdValid = true;

    const getAllOrder = await Order.findAll({
        attributes: ['id', 'status_order'],
        where:{
            status_order: {
                [Op.in]: ['On Progress']
            }
        }
    })
    // console.log(getAllOrder)

    const checkStatus = async () =>{
        let coreApiOrder = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        let transactionStatusOrder;
        for(let order of getAllOrder){
            let retries = 3;
    
            while(retries > 0){
                // console.log(retries)
                try {
                    transactionStatusOrder = await coreApiOrder.transaction.status(`NNN-${order.dataValues.id}`);
                    break;
                    // console.log(transactionStatus)
                } catch (error) {
                    if(error.httpStatusCode === '404'){
                        orderIdValid = false
                        break;
                    }
                    retries--;
                    if(retries === 0){
                        throw error;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                    } 
                }
            }

            if(transactionStatusOrder.transaction_status === 'settlement' && order.dataValues.status_order === 'Waiting Payment'){
                await Order.update({
                    status_pembayaran: "Berhasil",
                    status_order: "On Progress"
                }, 
                {
                    where:{
                        id: order.dataValues.id
                    }
                });

                await Chat.update({
                    status: 'On Progress'
                }, {
                    where: {
                        order_id: order.dataValues.id
                    }
                })
            }

        }
        
    }

    try {
        const userIsValid = await User.findOne({
            where: {
                id: value.userId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'User not found'
            })
        }

        await checkStatus().then(async () =>{
            const formattedData = [];
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
                                attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                                required: true,
                                include: [{
                                    model: Order,
                                    as: 'orders',
                                    attributes: [['id', 'order_id'], 'status_order'],
                                    where: {
                                        [Op.and]: [
                                            { status_order: {[Op.iLike] : '%On Progress%'} },
                                            { user_id: value.userId }
                                          ]
                                        // status_order:{
                                        //     [Op.iLike] : '%Waiting Payment%'
                                        // },
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
                                        [Op.and]: [
                                            { status_order: {[Op.iLike] : '%On Progress%'} },
                                            { user_id: value.userId }
                                          ]
                                        // status_order:{
                                        //     [Op.iLike] : '%Waiting Payment%'
                                        // },
                                    },
                                }]
                            },
                        ]
                    }
                ], logging:false
            },)
    
            if(data.length < 1){
                return res.status(404).json({
                    "response_code": 404,
                    "message": "Data not found"
                })
            }

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];
                // console.log(services)

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        // console.log(order.dataValues.orders.dataValues.status_order !== 'Cancel')
                        // console.log(order.dataValues.orders.dataValues.order_id)
                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    title: toko.dataValues.title,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }  
                    }
                }
            }
            formattedData.sort((a, b) => b.order_id - a.order_id);
            return res.status(200).json({
                response_code: 200,
                message: "Data Ditemukan",
                data: formattedData

            })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            response_code: 500,
            message: error.message,
        })
    }
}

const getOrderStatusCompleteExpireCancel = async (req, res) =>{

    const value = req.params
    let orderIdValid = true;

    const getAllOrder = await Order.findAll({
        attributes: ['id', 'status_order'],
        where:{
            status_order: {
                [Op.in]: ['Completed', 'Expired', 'Cancel']
            }
        }
    })

    const checkStatus = async () =>{
        let coreApiOrder = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        let transactionStatusOrder;
        for(let order of getAllOrder){
            let retries = 3;
    
            while(retries > 0){
                // console.log(retries)
                try {
                    transactionStatusOrder = await coreApiOrder.transaction.status(`NNN-${order.dataValues.id}`);
                    break;
                    // console.log(transactionStatus)
                } catch (error) {
                    if(error.httpStatusCode === '404'){
                        orderIdValid = false
                        break;
                    }
                    retries--;
                    if(retries === 0){
                        throw error;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                    } 
                }
            }

            if(transactionStatusOrder.transaction_status === 'expire' && order.dataValues.status_order === 'Waiting Payment'){
                await Order.update({
                    status_pembayaran: "Expired",
                    status_order: "Expired"
                }, 
                {
                    where:{
                        id: order.dataValues.id
                    }
                });

                await Chat.update({
                    status: 'Expired'
                }, {
                    where: {
                        order_id: order.dataValues.id
                    }
                })
            }

        }
    }

    try {
        const userIsValid = await User.findOne({
            where: {
                id: value.userId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'User not found'
            })
        }
        
        await checkStatus().then(async () =>{
            const formattedData = [];
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
                                attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                                required: true,
                                include: [{
                                    model: Order,
                                    as: 'orders',
                                    attributes: [['id', 'order_id'], 'status_order'],
                                    where: {
                                        [Op.and]: [
                                            { status_order: {[Op.in] : ['Completed', 'Expired', 'Cancel']} },
                                            { user_id: value.userId }
                                          ]
                                        // status_order:{
                                        //     [Op.iLike] : '%Waiting Payment%'
                                        // },
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
                                        [Op.and]: [
                                            { status_order: {[Op.in] : ['Completed', 'Expired', 'Cancel']} },
                                            { user_id: value.userId }
                                          ]
                                        // status_order:{
                                        //     [Op.iLike] : '%Waiting Payment%'
                                        // },
                                    },
                                }]
                            },
                        ]
                    }
                ], logging:false
            },)
    
            if(data.length < 1){
                return res.status(404).json({
                    "response_code": 404,
                    "message": "Data not found"
                })
            }

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];
                // console.log(services)

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        // console.log(order.dataValues.orders.dataValues.status_order !== 'Cancel')
                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    title: toko.dataValues.title,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }  
                    }
                }
            }

            return res.status(200).json({
                message: "Data Ditemukan",
                response_code: 200,
                data: formattedData.sort((a, b) => b.order_id - a.order_id)
            })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

// penyedia jasa
const getOrderStatusWaitingPaymentPenyediaJasa = async (req, res) => {

    const value = req.params
    let orderIdValid = true;

    try {

        const userIsValid = await PenyediaJasa.findOne({
            where: {
                id: value.penyediaId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'Penyedia Jasa not found'
            })
        }

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
                            attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                            required: true,
                            include: [{
                                model: Order,
                                as: 'orders',
                                attributes: [['id', 'order_id'], 'status_order'],
                                include: [
                                    {
                                        model: User,
                                        as: 'users',
                                        attributes: [['id', 'user_id'], 'nama']
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
                                    status_order: {[Op.iLike] : '%Waiting Payment%'} 
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
                                include: [
                                    {
                                        model: User,
                                        as: 'users',
                                        attributes: [['id', 'user_id'], 'nama']
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
                                    status_order: {[Op.iLike] : '%Waiting Payment%'} 
                                },
                            }]
                        },
                    ]
                }
            ],
            where: {
                penyedia_id: value.penyediaId
            },
            logging:false
        },)

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
                        const username = order.orders.dataValues.users.dataValues.nama

                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        let coreApi = new midtransClient.CoreApi({
                            isProduction: false,
                            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
                        });
                        let transactionStatus;
                        let retries = 3;
                
                        while(retries > 0){
                            // console.log(retries)
                            try {
                                transactionStatus = await coreApi.transaction.status(`NNN-${order.orders.dataValues.order_id}`);
                                break;
                                // console.log(transactionStatus)
                            } catch (error) {
                                if(error.httpStatusCode === '404'){
                                    orderIdValid = false
                                    break;
                                }
                                retries--;
                                if(retries === 0){
                                    throw error;
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                                } 
                            }
                        }

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            if (transactionStatus.transaction_status === 'expire' && order.dataValues.orders.dataValues.status_order !== 'Cancel' && order.dataValues.orders.dataValues.status_order !== 'On Progress') {
                                await Order.update({
                                    status_pembayaran: "Expired",
                                    status_order: 'Expired'
                                }, 
                                {
                                    where:{
                                        id: order.orders.dataValues.order_id
                                    }
                                });

                                await Chat.update({
                                    status: 'Expired'
                                }, {
                                    where: {
                                        order_id: order.orders.dataValues.order_id
                                    }
                                })
                            } else if(transactionStatus.transaction_status === 'settlement'){
                                await Order.update({
                                    status_pembayaran: "Berhasil",
                                    status_order: "On Progress"
                                }, 
                                {
                                    where:{
                                        id: order.orders.dataValues.order_id
                                    }
                                });

                                await Chat.update({
                                    status: 'On Progress'
                                }, {
                                    where: {
                                        order_id: order.orders.dataValues.order_id
                                    }
                                })
                            }
    
                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);
    
                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    // title: toko.dataValues.title,
                                    username: username,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }
                    }
                }
            }

        return res.status(200).json({
            message: "Data Ditemukan",
            response_code: 200,
            data: formattedData.sort((a, b) => b.order_id - a.order_id)

        })
    

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getOrderStatusOnProgressPenyediaJasa = async (req, res) => {

    const value = req.params
    let orderIdValid = true;

    const getAllOrder = await Order.findAll({
        attributes: ['id', 'status_order'],
        where:{
            status_order: {
                [Op.in]: ['On Progress']
            }
        }
    })
    // console.log(getAllOrder)

    const checkStatus = async () =>{
        let coreApiOrder = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        let transactionStatusOrder;
        for(let order of getAllOrder){
            let retries = 3;
    
            while(retries > 0){
                // console.log(retries)
                try {
                    transactionStatusOrder = await coreApiOrder.transaction.status(`NNN-${order.dataValues.id}`);
                    break;
                    // console.log(transactionStatus)
                } catch (error) {
                    retries--;
                    if(error.httpStatusCode === '404'){
                        orderIdValid = false
                        break;
                    }
                    if(retries === 0){
                        throw error;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                    } 
                }
            }

            if(transactionStatusOrder.transaction_status === 'settlement' && order.dataValues.status_order === 'Waiting Payment'){
                await Order.update({
                    status_pembayaran: "Berhasil",
                    status_order: "On Progress"
                }, 
                {
                    where:{
                        id: order.dataValues.id
                    }
                });

                await Chat.update({
                    status: 'On Progress'
                }, {
                    where: {
                        order_id: order.dataValues.id
                    }
                })
            }

        }
        
    }

    try {
        const userIsValid = await PenyediaJasa.findOne({
            where: {
                id: value.penyediaId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'Penyedia Jasa not found'
            })
        }

        await checkStatus().then(async () =>{
            const formattedData = [];
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
                                attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                                required: true,
                                include: [{
                                    model: Order,
                                    as: 'orders',
                                    attributes: [['id', 'order_id'], 'status_order'],
                                    include: [
                                        {
                                            model: User,
                                            as: 'users',
                                            attributes: [['id', 'user_id'], 'nama']
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
                                        status_order: {[Op.iLike] : '%On Progress%'}
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
                                    include: [
                                        {
                                            model: User,
                                            as: 'users',
                                            attributes: [['id', 'user_id'], 'nama']
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
                                        status_order: {[Op.iLike] : '%On Progress%'}
                                    },
                                }]
                            },
                        ]
                    }
                ],
                where:{
                    penyedia_id: value.penyediaId
                },
                logging:false
            },)
    
            if(data.length < 1){
                return res.status(404).json({
                    "response_code": 404,
                    "message": "Data not found"
                })
            }

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];
                // console.log(services)

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        const username = order.orders.dataValues.users.dataValues.nama

                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    // title: toko.dataValues.title,
                                    username: username,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }  
                    }
                }
            }
            formattedData.sort((a, b) => b.order_id - a.order_id);
            return res.status(200).json({
                message: "Data Ditemukan",
                response_code: 200,
                data: formattedData

            })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getOrderStatusCompleteExpireCancelPenyediaJasa = async (req, res) =>{

    const value = req.params
    let orderIdValid = true;

    const getAllOrder = await Order.findAll({
        attributes: ['id', 'status_order'],
        where:{
            status_order: {
                [Op.in]: ['Completed', 'Expired', 'Cancel']
            }
        }
    })

    const checkStatus = async () =>{
        let coreApiOrder = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        let transactionStatusOrder;
        for(let order of getAllOrder){
            let retries = 3;
    
            while(retries > 0){
                // console.log(retries)
                try {
                    transactionStatusOrder = await coreApiOrder.transaction.status(`NNN-${order.dataValues.id}`);
                    break;
                    // console.log(transactionStatus)
                } catch (error) {
                    if(error.httpStatusCode === '404'){
                        orderIdValid = false
                        break;
                    }
                    retries--;
                    if(retries === 0){
                        throw error;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                    } 
                }
            }

            if(transactionStatusOrder.transaction_status === 'expire' && order.dataValues.status_order === 'Waiting Payment'){
                await Order.update({
                    status_pembayaran: "Expired",
                    status_order: "Expired"
                }, 
                {
                    where:{
                        id: order.dataValues.id
                    }
                });

                await Chat.update({
                    status: 'Expired'
                }, {
                    where: {
                        order_id: order.dataValues.id
                    }
                })
            }

        }
    }

    try {
        const userIsValid = await PenyediaJasa.findOne({
            where: {
                id: value.penyediaId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '404',
                message: 'Penyedia Jasa not found'
            })
        }
        
        await checkStatus().then(async () =>{
            const formattedData = [];
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
                                attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
                                required: true,
                                include: [{
                                    model: Order,
                                    as: 'orders',
                                    attributes: [['id', 'order_id'], 'status_order'],
                                    include: [
                                        {
                                            model: User,
                                            as: 'users',
                                            attributes: [['id', 'user_id'], 'nama']
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
                                        status_order: {[Op.in] : ['Completed', 'Expired', 'Cancel']}
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
                                    include: [
                                        {
                                            model: User,
                                            as: 'users',
                                            attributes: [['id', 'user_id'], 'nama']
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
                                        status_order: {[Op.in] : ['Completed', 'Expired', 'Cancel']}
                                    },
                                }]
                            },
                        ]
                    }
                ],
                where: {
                    penyedia_id: value.penyediaId
                },
                logging:false
            },)
    
            if(data.length < 1){
                return res.status(404).json({
                    "response_code": 404,
                    "message": "Data not found"
                })
            }

            for (const toko of data) {
                const services = [...toko.hotels, ...toko.groomings];
                // console.log(services)

                for (const service of services) {
                    const hotelOrders = Array.isArray(service.detail_order_hotel) ? service.detail_order_hotel : [];
                    const groomingOrders = Array.isArray(service.detail_order_grooming) ? service.detail_order_grooming : [];
                    const orders = [...hotelOrders, ...groomingOrders];

                    for (const order of orders) {
                        const username = order.orders.dataValues.users.dataValues.nama

                        // console.log(order.dataValues.orders.dataValues.status_order !== 'Cancel')
                        let differenceInMilliseconds = 0;
                        let differenceInDays = 0;
                        if(hotelOrders.length > 0){
                            // Calculate the difference in milliseconds
                            differenceInMilliseconds = service.detail_order_hotel[0].dataValues.tanggal_keluar.getTime() - service.detail_order_hotel[0].dataValues.tanggal_masuk.getTime()

                            // Convert the difference to days
                            differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                            console.log(`The difference between the two dates is ${differenceInDays} days.`);
                        }

                        if(orderIdValid === false){
                            orderIdValid = true; //set valid to default value
                            continue;
                        } else {
                            let existingOrder = formattedData.find(o => o.order_id === order.orders.dataValues.order_id);

                            if (existingOrder) {
                                // sum total_payment from same order_id
                                existingOrder.total_payment += service.harga * order.quantity;
                            } else {
                                formattedData.push({
                                    order_id: order.orders.dataValues.order_id,
                                    // title: toko.dataValues.title,
                                    username: username,
                                    service_type: hotelOrders.length > 0 ? 'Pet Hotel' : 'Pet Grooming',
                                    status: order.orders.status_order,
                                    total_payment: hotelOrders.length > 0 ? service.harga * order.quantity * differenceInDays : service.harga * order.quantity
                                });
                            }
                        }  
                    }
                }
            }

            return res.status(200).json({
                message: "Data Ditemukan",
                response_code: 200,
                data: formattedData.sort((a, b) => b.order_id - a.order_id)
            })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
            response_code: 500,
        })
    }
}

const getDetailOrderPenyedia = async (req, res) => {

    const value = req.params

    try {

        const userIsValid = await PenyediaJasa.findOne({
            where: {
                id: value.penyediaId
            }
        })

        if(!userIsValid){
            return res.status(404).json({
                response_code: '400',
                message: 'User not found'
            })
        }

        const data = await Toko.findAll({
            attributes: [
                ['id', 'id_toko'],
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
                            attributes: ['quantity', 'tanggal_masuk', 'tanggal_keluar'],
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
                                        attributes: [['id', 'user_id'], 'nama', 'uid']
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
                                        attributes: [['id', 'user_id'], 'nama', 'uid']
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
            where: {
                id: {
                  [Op.in]: sequelize.literal(`(SELECT a.toko_id FROM hotel a INNER JOIN detail_order_hotel b ON a.id = b.hotel_id 
                    WHERE b.order_id = ${value.orderId}
                    UNION 
                    SELECT c.toko_id FROM grooming c INNER JOIN detail_order_grooming d ON c.id = d.grooming_id
                    WHERE d.order_id = ${value.orderId})`)
                }
              },
        });

        let totalPrice = 0;
        // console.log(data)
        // console.log(value.orderId)

        const formattedData = await Promise.all(data.map(async toko => {  
            // console.log(toko)
            
            let remainingTime = 0;
            const now = new Date();
           
            const tokoData = toko?.dataValues;
            // if(tokoData.groomings.length === 0 && tokoData.hotels.length === 0){
                
            // } else {
                const hotelData = tokoData.hotels[0]? tokoData.hotels[0]?.dataValues : null;
                const groomingData = tokoData.groomings[0]? tokoData.groomings[0]?.dataValues : null;
                const orderData = hotelData ? hotelData.detail_order_hotel[0].orders?.dataValues : groomingData.detail_order_grooming[0].orders?.dataValues;

                let differenceInMilliseconds
                let differenceInDays
                if(hotelData){
                    // Calculate the difference in milliseconds
                    differenceInMilliseconds = hotelData ? hotelData.detail_order_hotel[0]?.dataValues.tanggal_keluar.getTime() - hotelData.detail_order_hotel[0]?.dataValues.tanggal_masuk.getTime():''

                    // Convert the difference to days
                    differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

                    console.log(`The difference between the two dates is ${differenceInDays} days.`);
                }

                // CHECK STATUS TRANS
                let coreApi = new midtransClient.CoreApi({
                    isProduction: false,
                    serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
                    clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
                });
                let transactionStatus;
                let retries = 3;
        
                while(retries > 0){
                    // console.log(retries)
                    try {
                        transactionStatus = await coreApi.transaction.status(`NNN-${value.orderId}`);
                        break;
                        // console.log(transactionStatus)
                    } catch (error) {
                        retries--;
                        if(retries === 0){
                            throw error;
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                        } 
                    }
                }
                // console.log(transactionStatus)

                // Check if transaction is expired
                if (transactionStatus.transaction_status === 'expire' && orderData.status_order === 'Waiting Payment') {
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

                    await Chat.update({
                        status: 'Expired'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })
                } else if(transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment'){
                    await Order.update({
                        status_pembayaran: "Berhasil",
                        status_order: "On Progress"
                    }, 
                    {
                        where:{
                            id: value.orderId
                        }
                    });

                    await Chat.update({
                        status: 'On Progress'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })
                } else if(transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Completed'){
                    await Order.update({
                        status_pembayaran: "Berhasil",
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
                if (diffInMilliseconds < 3 * 60 * 1000) { // If less than 15 minutes
                    const diffInSeconds = Math.floor(diffInMilliseconds / 1000); // Convert to seconds
                    const remainingMilliseconds = 3 * 60 * 1000 - diffInMilliseconds;
                    const remainingSeconds = Math.floor(remainingMilliseconds / 1000); // Convert to seconds
                    minutes = Math.floor(remainingSeconds / 60);
                    seconds = remainingSeconds % 60;
                    remainingTime = `${minutes} minutes ${seconds} seconds`;
                }

                if(orderData.status_order === 'Cancel' || orderData.status_order === 'On Progress' || transactionStatus.transaction_status === 'settlement'){
                    minutes = 0;
                    seconds = 0;
                }

                if(minutes === 0 && seconds === 0 && orderData.status_order !== 'Cancel' && orderData.status_order !== 'On Progress' && orderData.status_order !== 'Completed' && transactionStatus.transaction_status === 'expire'){
                    await Order.update({
                        status_order: 'Expired'
                    }, 
                    {
                        where:{
                            id: value.orderId
                        }
                    })

                    await Chat.update({
                        status: 'Expired'
                    }, {
                        where: {
                            order_id: value.orderId
                        }
                    })
                }

                const userData = orderData.users?.dataValues;
                const reviewData = orderData.reviews ? orderData.reviews?.dataValues : null ;
                // console.log(orderData)
                if(hotelData !== null){
                    if(reviewData !== null){
                        return {
                            id_toko: tokoData.id_toko,
                            // nama_toko: tokoData.pet_shop_name,
                            username: userData.nama,
                            user_id: userData.user_id,
                            uid: userData.uid,
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
                            check_in: hotelData.detail_order_hotel[0].dataValues.tanggal_masuk,
                            check_out: hotelData.detail_order_hotel[0].dataValues.tanggal_keluar,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
                            tanggal_order: orderData.tanggal_order,
                            updatedAt: orderData.updatedAt,
                            createdAt: orderData.createdAt,
                            deletedAt: orderData.deletedAt,
                            order_detail: tokoData.hotels.map(hotel => {
                                const hotelData = hotel?.dataValues;
                                totalPrice += hotelData.harga * hotelData.detail_order_hotel[0]?.dataValues.quantity * differenceInDays
                                return {
                                    hotel_id: hotelData.id,
                                    hotel_title: hotelData.title_hotel,
                                    quantity: hotelData.detail_order_hotel[0]?.dataValues.quantity,
                                    price: hotelData.harga
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
                            // nama_toko: tokoData.pet_shop_name,
                            username: userData.nama,
                            user_id: userData.user_id,
                            uid: userData.uid,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
                            metode_pembayaran: orderData.metode_pembayaran,
                            // remaining_time: remainingTime,
                            time:{
                                minutes: minutes,
                                seconds: seconds
                            },
                            // total_price: orderData.total_price,
                            virtual_number: orderData.virtual_number,
                            check_in: hotelData.detail_order_hotel[0].dataValues.tanggal_masuk,
                            check_out: hotelData.detail_order_hotel[0].dataValues.tanggal_keluar,
                            // status_order: orderData.status_order,
                            tanggal_order: orderData.tanggal_order,
                            updatedAt: orderData.updatedAt,
                            createdAt: orderData.createdAt,
                            deletedAt: orderData.deletedAt,
                            order_detail: tokoData.hotels.map(hotel => {
                                const hotelData = hotel?.dataValues;
                                totalPrice += hotelData.harga * hotelData.detail_order_hotel[0]?.dataValues.quantity * differenceInDays
                                return {
                                    hotel_id: hotelData.id,
                                    hotel_title: hotelData.title_hotel,
                                    quantity: hotelData.detail_order_hotel[0]?.dataValues.quantity,
                                    price: hotelData.harga
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
                            // nama_toko: tokoData.pet_shop_name,
                            username: userData.nama,
                            user_id: userData.user_id,
                            uid: userData.uid,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
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
                                const groomingData = grooming?.dataValues;
                                totalPrice += groomingData.harga * groomingData.detail_order_grooming[0]?.dataValues.quantity
                                return {
                                    grooming_id: groomingData.id,
                                    grooming_title: groomingData.title_grooming,
                                    quantity: groomingData.detail_order_grooming[0]?.dataValues.quantity,
                                    price: groomingData.harga
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
                            // nama_toko: tokoData.pet_shop_name,
                            username: userData.nama,
                            user_id: userData.user_id,
                            uid: userData.uid,
                            order_id: orderData.order_id,
                            order_status: transactionStatus.transaction_status === 'settlement' && orderData.status_order === 'Waiting Payment' ? 'On Progress' : orderData.status_order,
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
                                const groomingData = grooming?.dataValues;
                                totalPrice += groomingData.harga * groomingData.detail_order_grooming[0]?.dataValues.quantity
                                return {
                                    grooming_id: groomingData.id,
                                    grooming_title: groomingData.title_grooming,
                                    quantity: groomingData.detail_order_grooming[0]?.dataValues.quantity,
                                    price: groomingData.harga
                                };
                            }),
                            total_price: totalPrice, 
                            review: null,
                            service_type: "Grooming"
                        };
                    }
                // }
            }
        }));
        
        return res.status(200).json({
            response_code: 200,
            message: "Data detail order berhasil diambil",
            // data: formattedData.filter(item => item !== null)
            data: formattedData
        })
    } catch(e) {
        console.log(e.message)
        return res.status(500).json({
            message: e.message
        })
    }
}

module.exports = {
    createOrder,
    getPaymentData,
    checkPaymentStatus,
    setPaymentToExpired,
    getDetailOrder,
    getOrderStatusWaitingPayment,
    getOrderStatusOnProgress,
    getOrderStatusCompleteExpireCancel,
    setOrderToCompleted,
    getOrderStatusWaitingPaymentPenyediaJasa,
    getOrderStatusOnProgressPenyediaJasa,
    getOrderStatusCompleteExpireCancelPenyediaJasa,
    getDetailOrderPenyedia

}
