'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('hewan_peliharaan', {
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
      nama_hewan: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      jenis_hewan: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      size_hewan: {
        type: Sequelize.STRING(13),
        allowNull: false
      },
      umur_hewan: {
        type: Sequelize.INTEGER(2),
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING(255),
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
    await queryInterface.dropTable('hewan_peliharaan');
  }
};
