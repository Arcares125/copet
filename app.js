const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth')
const petRouter = require('./routes/hewan_peliharaan')
const token = require('./routes/get_token')
const penyediaJasaRouter = require('./routes/penyedia_jasa')
const tokoRouter = require('./routes/toko');
const dokterRouter = require('./routes/dokter');
const trainerRouter = require('./routes/trainer');
const hotelRouter = require('./routes/hotel');
const orderRouter = require('./routes/order');
const detailOrderHotelRouter = require('./routes/detail_order_hotel');
const detailOrderGroomingRouter = require('./routes/detail_order_grooming');
const reviewRouter = require('./routes/review');
const groomingRouter = require('./routes/grooming')
const port = process.env.PORT || 4000;


dotenv.config()
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter)
app.use('/pet', petRouter)
app.use('/get-token', token)
app.use('/penyedia-jasa', penyediaJasaRouter)
app.use('/toko', tokoRouter)
app.use('/dokter', dokterRouter)
app.use('/trainer', trainerRouter)
app.use('/hotel', hotelRouter)
app.use('/grooming', groomingRouter)
app.use('/order', orderRouter)
app.use('/detail-order-hotel', detailOrderHotelRouter)
app.use('/detail-order-grooming', detailOrderHotelRouter)
app.use('/review', reviewRouter)



// app.listen(port, () => {
        // console.log(`Listening on PORT:${port}`);
    // }
// )

module.exports = app;
