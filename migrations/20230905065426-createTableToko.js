'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('toko', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      penyedia_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      nama: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      foto: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
        // defaultValue: 
      },
      fasilitas: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      lokasi: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      jam_buka: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      jam_tutup: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull:true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull:true,
      }
  });
    
  },

  async down (queryInterface, Sequelize) {

  await queryInterface.dropTable('toko');
    
  }
};
