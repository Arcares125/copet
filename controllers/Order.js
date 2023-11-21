const {Dokter,PenyediaJasa, sequelize, Order, VirtualAccount} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env
        const midtransClient = require('midtrans-client');


const createOrder = async (req, res) => {

    const data = req.body

    try {

        const dataOrder = await Order.create(data)
        return res.status(201).json({
            message: "Data Order Berhasil Disimpan",
            kode: 201,
            data: dataOrder
        })

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
        
        coreApi.transaction.status(orderId).then((response) => {
            console.log(response)
            console.log('Transaction status:', response.transaction_status);

            if (response.transaction_status === 'settlement') {
                console.log('Transaction is successful');
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