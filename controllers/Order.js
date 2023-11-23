const {Dokter,
    PenyediaJasa, 
    sequelize, 
    Order, 
    VirtualAccount, 
    DetailOrderGrooming, 
    DetailOrderHotel, 
    Grooming, 
    Hotel} = require("../models")

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
            status_order: "Menunggu Pembayaran",
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
                    ...dataDetailGrooming,
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
                message: "Data Order Berhasil Disimpan",
                response_code: 200,
                data: {
                    order: dataOrder.dataValues,
                    detail: details,
                    total_price: totalPrice,
                    id,
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
                    { status_pembayaran: "Berhasil" },
                    { where: {id: orderId} })

                return res.status(200).json({
                    "response_code": 200,
                    "Transaction Status": "Paid"
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

module.exports = {
    createOrder,
    getPaymentData,
    checkPaymentStatus
}