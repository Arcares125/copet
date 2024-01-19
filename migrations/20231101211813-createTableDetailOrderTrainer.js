'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_trainer', {
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
      trainer_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tanggal_pertemuan: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      jam_pertemuan: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      durasi_pertemuan: {
        type: Sequelize.DATE,
        allowNull: false
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.dropTable('detail_order_trainer');
  }
};
