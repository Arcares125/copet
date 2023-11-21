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

    // const data = req.body
    // const {payment_type, bca_va: { va_number, sub_company_code }, free_text: {va_name}} = req.body

    try {

        let coreApi = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
            clientKey: 'SB-Mid-client-DTbwiKD76w8ktHoN'
        });
        
        let parameter = req.body;
        
        
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
                nama,
                kode,
                'transactionStatus': chargeResponse.transaction_status, 
                'fraudStatus': chargeResponse.fraud_status
            });
        }).catch((e) => {
            console.log('Error occured:', e.message);
        });

        // let snap = new midtransClient.Snap({
        //     isProduction : false,
        //     serverKey : 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
        //     clientKey : 'SB-Mid-client-DTbwiKD76w8ktHoN'
        // });

        // // const parameter = data
        // let transactionToken
        // let transactionRedirectUrl
        // snap.createTransaction(req.body)
        //     .then(async (transaction) => {

        //         console.log(transaction)

        //         transactionToken = transaction.token;
        //         console.log('Transaction token:', transactionToken);
        
        //         transactionRedirectUrl = transaction.redirect_url;
        //         console.log('Transaction redirect URL:', transactionRedirectUrl);

        //         const dataTrans = await VirtualAccount.create({
        //             nama: va_name,
        //             kode: "74686"+va_number
        //         })

        //         const {id, nama, kode} = dataTrans

        //         return res.status(200).json({
        //             'response_code': 200, 
        //             id,
        //             nama,
        //             kode,
        //             'transactionToken': transactionToken, 
        //             'transactionRedirectUrl': transactionRedirectUrl
        //         });
        //     })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            kode: 500,
        })
    }
}

module.exports = {
    createOrder,
    getPaymentData
}