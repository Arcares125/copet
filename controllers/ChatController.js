const {User, PenyediaJasa, Order, Chat, sequelize, Sequelize, Toko} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH,
        SERVER_KEY,
        CLIENT_KEY } = process.env
        const midtransClient = require('midtrans-client');


        

const checkStatus = async () =>{
    const getAllListChatToUpdateOrderStatus = await Chat.findAll()
    let orderIdValid = true;

    let coreApiOrder = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: SERVER_KEY,
        clientKey: CLIENT_KEY
    });
    let transactionStatusOrder;
    for(let order of getAllListChatToUpdateOrderStatus){

        let retries = 3;

        while(retries > 0){

            try {
                transactionStatusOrder = await coreApiOrder.transaction.status(`YYY-${order.dataValues.order_id}`);//redeploy
                break;
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

        if(transactionStatusOrder.transaction_status === 'settlement' && order.dataValues.status === 'Waiting Payment'){
            await Order.update({
                status_pembayaran: "Berhasil",
                status_order: "On Progress"
            }, 
            {
                where:{
                    id: order.dataValues.order_id
                }
            });

            await Chat.update({
                status: 'On Progress'
            }, {
                where: {
                    order_id: order.dataValues.order_id
                }
            })
        } else if(transactionStatusOrder.transaction_status === 'expire' && order.dataValues.status === 'Waiting Payment'){
            await Order.update({
                status_pembayaran: "Expired",
                status_order: "Expired"
            }, 
            {
                where:{
                    id: order.dataValues.order_id
                }
            });

            await Chat.update({
                status: 'Expired'
            }, {
                where: {
                    order_id: order.dataValues.order_id
                }
            })
        }
    }
}

const getOnProgressChat = async (req, res) => {

    const data = req.params
    let dataOrder = []

    try {

        await checkStatus().then(async () =>{

            const getUserByOrder = await Order.findAll({
                where:{
                    user_id: data.userId
                }
            })

            for(let allOrder of getUserByOrder){
                const getChatOnProgress = await Chat.findOne({
                    where: {
                        status: {
                            [Op.iLike]: '%On Progress%'
                        },
                        order_id: allOrder.dataValues.id
                    }
                })
                if(getChatOnProgress){
                    dataOrder.push(getChatOnProgress)
                } else {
                    continue;
                }
            }
            
            if(dataOrder.length === 0){
                res.status(200).json({
                    response_code: 200,
                    message: "No Transaction with status On Progress"
                })
            } else {
                res.status(200).json({
                    response_code: 200,
                    message: "List On Progress Chat retrieved.",
                    data: dataOrder.sort((a, b) => b.order_id - a.order_id)
                })    
            }
        })
        
    } catch (error) {
        res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getAllChat = async (req, res) => {

    try {

        const getAllChat = await Chat.findAll()

        res.status(200).json({
            response_code: 200,
            message: "All list chat retrieved",
            data: getAllChat.sort((a, b) => b.order_id - a.order_id)
        })    
        
    } catch (error) {
        res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const getDetailChat = async (req, res) => {

    const value = req.params
    try {

        const getAllChat = await Chat.findOne({
            where:{
                order_id: value.orderId
            }
        })

        res.status(200).json({
            response_code: 200,
            message: "Chat Data Retrieved",
            data: getAllChat
        })    
        
    } catch (error) {
        res.status(500).json({
            response_code: 500,
            message: error.message
        })
    }
}

const startChat = async (req, res) => {

    const value = req.body

    try {
        
        await Chat.update({
            room_id: value.room_id
        },{
            where: {
                order_id: value.order_id
            }
        })

        return res.status(200).json({
            response_code: 200,
            message: "Room Chat Started"
        })
    } catch (error) {
        return res.status(500).json({
            response_code: 500,
            message: "Internal Server Error",
            error: error.message
        })
    }

}

module.exports = {
    getOnProgressChat,
    getAllChat,
    startChat,
    getDetailChat
}