'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pet_activity', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      hewan_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      nama: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      tanggal_aktivitas: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      mulai_aktivitas: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      akhir_aktivitas: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      isAllDay: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      background: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(255),
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

  await queryInterface.dropTable('pet_activity');
    
  }
};
