'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_grooming', {
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
      grooming_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tanggal_grooming: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      alamat_pelanggan_grooming: {
        type: Sequelize.STRING(255),
        allowNull:false,
      },
      metode_penjemputan_grooming: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.dropTable('detail_order_grooming');
  }
};
