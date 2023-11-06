'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
       id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nama: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      noTelp: {
        type: Sequelize.STRING(13),
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM,
        values: ['Male', 'Female'],
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      refreshToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      // role: {
      //   type: Sequelize.ENUM,
      //   values: ['Pelanggan', 'Dokter', 'Trainer', 'Grooming']
      // }
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

  await queryInterface.dropTable('users');
    
  }
};
