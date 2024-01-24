'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('trainer', {
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
      spesialis: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pengalaman: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      harga: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lokasi: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      is_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      foto: {
        type: Sequelize.TEXT,
        allowNull: true,
        // defaultValue: 
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

  await queryInterface.dropTable('trainer');
    
  }
};
