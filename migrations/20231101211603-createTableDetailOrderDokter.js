'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detail_order_dokter', {
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dokter_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      diskon: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      durasi_konsultasi: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      jam_konsultasi: {
        type: Sequelize.DATE,
        allowNull:true,
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
    await queryInterface.dropTable('detail_order_dokter');
  }
};
