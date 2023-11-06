'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_pet_activity', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      activity_id: {
        type: Sequelize.INTEGER,
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
      activity_mulai: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      activity_akhir: {
        type: Sequelize.DATE,
        allowNull:false,
      },
  });
    
  },

  async down (queryInterface, Sequelize) {

  await queryInterface.dropTable('detail_pet_activity');
    
  }
};
