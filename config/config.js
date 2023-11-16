// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('detail_order_grooming', {
//       id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//         allowNull: false
//       },
//       order_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//       },
//       grooming_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//       },
//       tanggal_grooming: {
//         type: Sequelize.DATE,
//         allowNull:false,
//       },
//       alamat_pelanggan_grooming: {
//         type: Sequelize.STRING(255),
//         allowNull:false,
//       },
//       metode_penjemputan_grooming: {
//         type: Sequelize.STRING(100),
//         allowNull: false
//       },
//       discount: {
//         type: Sequelize.INTEGER,
//         allowNull: true
//       },
//       quantity: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull:false,
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull:true,
//       },
//       deletedAt: {
//         type: Sequelize.DATE,
//         allowNull:true,
//       }
//   });
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.dropTable('detail_order_grooming');
//   }
// };

require('dotenv').config()
module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.DB_PORT
    // "username": process.env.DB_USERNAME,
    // "password": process.env.PGPASSWORD,
    // "database": process.env.PGDATABASE,
    // "host": process.env.PGHOST,
    // "dialect": process.env.DB_DIALECT,
    // "port": process.env.PGPORT
    
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.DB_PORT
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.DB_PORT
  }
}
