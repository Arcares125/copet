// const {Dokter,PenyediaJasa, sequelize, Order, VirtualAccount} = require("../models")
// const bcrypt = require('bcrypt')
// const saltRounds = 10;
// const jwt = require('jsonwebtoken');
// const { QueryTypes } = require("sequelize");
// const {TOKEN_LOGIN,
//         TOKEN_REFRESH } = process.env
// const midtransClient = require('midtrans-client');

// const getPaymentData = async (req, res) => {

//     const data = req.body

//     try {

//         let snap = new midtransClient.Snap({
//             isProduction : false,
//             serverKey : 'SB-Mid-server-Bi8zFkdl155n5vQ3tAH3-6et',
//             clientKey : 'SB-Mid-client-DTbwiKD76w8ktHoN'
//         });

//         const parameter = data
//         let transactionToken
//         let transactionRedirectUrl
//         snap.createTransaction(parameter)
//             .then((transaction) => {
//                 console.log(transaction)
//                 // transaction token
//                 transactionToken = transaction.token;
//                 console.log('Transaction token:', transactionToken);
        
//                 // transaction redirect url
//                 transactionRedirectUrl = transaction.redirect_url;
//                 console.log('Transaction redirect URL:', transactionRedirectUrl);
        
//                 // virtual account number
//                 // let vaNumber = transaction.va_numbers;
//                 // console.log('Virtual account number:', vaNumber);
//                 res.json({ 
//                     'transactionToken': transactionToken, 
//                     'transactionRedirectUrl': transactionRedirectUrl,
//                     // 'vaNumber': parameter.bank_transfer.va_numbers
//                 });
//             })
           

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             response_code: 500,
//         })
//     }
// }

// module.exports = {
//     getPaymentData
// }