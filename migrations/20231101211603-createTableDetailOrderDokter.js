'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_dokter', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dokter_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tanggal_konsultasi: {
        type: Sequelize.DATE,
        allowNull:true,
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      durasi_konsultasi: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      jam_konsultasi: {
        type: Sequelize.DATE,
        allowNull:true,
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
    await queryInterface.dropTable('detail_order_dokter');
  }
};
