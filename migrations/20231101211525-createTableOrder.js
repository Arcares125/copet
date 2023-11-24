'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('order', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      virtual_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status_order: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      metode_pembayaran: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      status_pembayaran: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      tanggal_order: {
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
    await queryInterface.dropTable('order');
  }
};
