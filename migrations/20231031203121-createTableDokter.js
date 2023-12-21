'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dokter', {
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
        type: Sequelize.STRING(255),
        allowNull: false
      },
      spesialis: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pengalaman: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      harga: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      alumni: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lokasi_praktek: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      no_str: {
        type: Sequelize.STRING(16),
        allowNull: false
      },
      is_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 'false'
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

  await queryInterface.dropTable('dokter');
    
  }
};
