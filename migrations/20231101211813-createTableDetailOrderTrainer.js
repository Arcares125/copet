'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_trainer', {
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      trainer_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      jam_pertemuan: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      durasi_pertemuan: {
        type: Sequelize.DATE,
        allowNull: false
      },
      diskon: {
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
