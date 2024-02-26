const {User, PenyediaJasa , sequelize, Sequelize, Toko, Dokter, Trainer} = require("../models")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { QueryTypes, Op } = require("sequelize");
const {TOKEN_LOGIN,
        TOKEN_REFRESH } = process.env

const loginUser = async (req, res) =>{
    // const email = req.body.email
    // const password = req
    const { email, password } = req.body
    
    try {
        const getEmail = await User.findOne({
            where: {
                email: email
            },
            logging: true
        })

        if(!getEmail) return res.status(404).json({
            response_code: 404,
            message: "Wrong email / password",
        })
        
        const comparePass = await bcrypt.compare(password, getEmail.password)
        if(!comparePass) return res.status(404).json({
            response_code: 404,
            message: "Wrong email / password",
        })

        const user = {
            id: getEmail.id,
            email: getEmail.email,
            no_telp: getEmail.no_telp,
            username: getEmail.nama
        }

        const tokenLogin = jwt.sign(user, TOKEN_LOGIN, { expiresIn: '5m' })
        const refreshToken = jwt.sign(user, TOKEN_REFRESH, { expiresIn: '7d' })

        await User.update({ refreshToken: refreshToken },
            { where: { email: user.email} }
        )

        res.status(200).json({
            response_code: 200,
            message: "Login Success",
            data: user,
            token: tokenLogin,
            refreshToken: refreshToken
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            response_code: 500,
            error: error.message,
        })
    }

}

const registerUser = async (req, res) => {
    // const {nama, email, phone, gender, password} = req.body
    const data = req.body
    try {

        const checkEmail = await User.findOne({
            where: {
                email: data.email
            },
            logging: true
        })

        if(checkEmail){
            return res.status(200).json({
                response_code: 200,
                message: "Email already registered",
            })    
        }

        const passHash = await bcrypt.hash(data.password, saltRounds);
        const result = await User.create({...data, password: passHash})

        res.status(200).json({
            response_code:200,
            message: "Register Success",
            data: result
        })    
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const logout = async (req, res) => {

    const { email } = req.body

    const getData = User.findOne({
        where: {
            email:email
        }
    })

    await User.update({ refreshToken: null },
        { where: 
            { email: email }
        }
    )
}

const getToken = async (req, res) => {

    try {
        const { email, password } = req.body
    
        const user = {
            email: email,
            password: password
        }
    
        const token = jwt.sign(user, TOKEN_LOGIN, {expiresIn: '5m'})
        return res.status(200).json({
            token: token
        })
    } catch (error) {
        return res.status(400).json({
            err: error
        })
    }
}

// Penyedia Jasa
const loginPenyediaJasa = async (req, res) =>{
    const { email, password } = req.body
    
    try {

        if(email === 'copetCS@gmail.com' && password === 'admin123'){
            res.status(200).json({
                response_code: 200,
                message: "Login Success",
                data:{
                    id: 1,
                    email: "copetCS@gmail.com",
                    username: "Admin Kenth",
                    no_telp: "081227127321",
                    user_type: "admin"
                },
                token: TOKEN_LOGIN,
                refreshToken: TOKEN_REFRESH
                
            })
        } else if(email !== 'copetCS@gmail.com' && password === 'admin123'){
            res.status(200).json({
                response_code: 200,
                message: "Login Failed",
            })
        } else if(email === 'copetCS@gmail.com' && password !== 'admin123'){
            res.status(200).json({
                response_code: 200,
                message: "Login Failed",
            })
        } else {
            const getDataPenyedia = await PenyediaJasa.findOne({
                where: {
                    email: email
                },
                logging: false
            })
    
            if(!getDataPenyedia) return res.status(404).json({
                response_code: 404,
                message: "Wrong email / password"
            })
            
            const comparePass = await bcrypt.compare(password, getDataPenyedia.password)
            if(!comparePass) return res.status(404).json({
                response_code: 404,
                message: "Wrong email / password"
            })
    
            const penyediaJasa = {
                id: getDataPenyedia.dataValues.id,
                email: getDataPenyedia.dataValues.email,
                no_telp: getDataPenyedia.dataValues.no_telp,
                username: getDataPenyedia.dataValues.nama,
                jenis_jasa: getDataPenyedia.dataValues.jenis_jasa,
                is_acc: getDataPenyedia.dataValues.is_acc
            }
    
            const getDataToko = await Toko.findOne({
                where: {
                    penyedia_id: getDataPenyedia.dataValues.id
                }
            })
    
            const getDataDokter = await Dokter.findOne({
                where: {
                    penyedia_id: getDataPenyedia.dataValues.id
                }
            })
    
            const getDataTrainer = await Trainer.findOne({
                where: {
                    penyedia_id: getDataPenyedia.dataValues.id
                }
            })
            
            const tokenLogin = jwt.sign(penyediaJasa, TOKEN_LOGIN, { expiresIn: '5m' })
            const refreshToken = jwt.sign(penyediaJasa, TOKEN_REFRESH, { expiresIn: '7d' })
            // II202311240006
            if(getDataPenyedia.dataValues.jenis_jasa !== null && getDataPenyedia.dataValues.is_acc === false){
                if(getDataToko){
                    if(getDataToko.dataValues.is_acc === true){
                        await getDataPenyedia.update({
                            is_acc: true
                        })
        
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
    
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {toko_id:getDataToko.dataValues.id, ...penyediaJasa, is_acc: true},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    } else {
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
                
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {toko_id:getDataToko.dataValues.id, ...penyediaJasa},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    }
                }
    
                if(getDataDokter){
                    if(getDataDokter.dataValues.is_acc === true){
                        await getDataPenyedia.update({
                            is_acc: true
                        })
        
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
        
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {dokter_id: getDataDokter.dataValues.id, ...penyediaJasa, is_acc: true},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    } else {
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
                
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {dokter_id: getDataDokter.dataValues.id, ...penyediaJasa},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    }
                }
    
                if(getDataTrainer){
                    if(getDataTrainer.dataValues.is_acc === true){
                        await getDataPenyedia.update({
                            is_acc: true
                        })
        
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
        
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {trainer_id:getDataTrainer.dataValues.id, ...penyediaJasa, is_acc: true},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    } else {
                        await PenyediaJasa.update({ refreshToken: refreshToken },
                            { where: { email: penyediaJasa.email} }
                        )
                
                        res.status(200).json({
                            response_code: 200,
                            message: "Login Success",
                            data: {trainer_id: getDataTrainer.dataValues.id, ...penyediaJasa},
                            token: tokenLogin,
                            refreshToken: refreshToken
                        })
                    }
                }
    
    
            } else {
                if(getDataToko){
                    await PenyediaJasa.update({ refreshToken: refreshToken },
                        { where: { email: penyediaJasa.email} }
                    )
            
                    res.status(200).json({
                        response_code: 200,
                        message: "Login Success",
                        data: { toko_id:getDataToko.dataValues.id, ...penyediaJasa },
                        token: tokenLogin,
                        refreshToken: refreshToken
                    })
                } else if(getDataDokter){
                    await PenyediaJasa.update({ refreshToken: refreshToken },
                        { where: { email: penyediaJasa.email} }
                    )
            
                    res.status(200).json({
                        response_code: 200,
                        message: "Login Success",
                        data: { dokter_id:getDataDokter.dataValues.id, ...penyediaJasa },
                        token: tokenLogin,
                        refreshToken: refreshToken
                    })
                } else if(getDataTrainer){
                    await PenyediaJasa.update({ refreshToken: refreshToken },
                        { where: { email: penyediaJasa.email} }
                    )
            
                    res.status(200).json({
                        response_code: 200,
                        message: "Login Success",
                        data: { trainer_id:getDataTrainer.dataValues.id, ...penyediaJasa },
                        token: tokenLogin,
                        refreshToken: refreshToken
                    })
                } else {
                    await PenyediaJasa.update({ refreshToken: refreshToken },
                        { where: { email: penyediaJasa.email} }
                    )
            
                    res.status(200).json({
                        response_code: 200,
                        message: "Login Success",
                        data: {...penyediaJasa },
                        token: tokenLogin,
                        refreshToken: refreshToken
                    })
                }
            }
        }
        
    } catch (error) {
        res.json({
            response_code: 500,
            message: error.message
        })
    }
}

module.exports = {
    loginUser,
    registerUser,
    loginPenyediaJasa,
    logout,
    getToken
}