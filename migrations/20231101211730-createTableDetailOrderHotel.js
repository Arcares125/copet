'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_hotel', {
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
      hotel_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tanggal_masuk: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      tanggal_keluar: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      metode_penjemputan: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('detail_order_hotel');
  }
};
