module.exports = (sequelize, DataTypes) =>{
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          // virtual_id: {
          //   type: DataTypes.INTEGER,
          //   allowNull: false,
          // },
          status_order: {
            type: DataTypes.STRING(20),
            allowNull: false
          },
          metode_pembayaran: {
            type: DataTypes.STRING(10),
            allowNull: false
          },
          status_pembayaran: {
            type: DataTypes.STRING(10),
            allowNull: false
          },
          tanggal_order: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull:true,
          },
          deletedAt: {
            type: DataTypes.DATE,
            allowNull:true,
          }
    }, {
        tableName: 'order',
        timestamps: true,
        paranoid: true
    })

    Order.associate = (models) =>{
      Order.hasMany(models.DetailOrderHotel, {
        as: 'detail_order_hotel',
        foreignKey: 'order_id'
      });

      Order.hasMany(models.DetailOrderGrooming, {
        as: 'detail_order_grooming',
        foreignKey: 'order_id'
      })

      Order.hasMany(models.DetailOrderTrainer, {
        as: 'detail_order_trainer',
        foreignKey: 'order_id'
      })

      Order.hasMany(models.DetailOrderDokter, {
        as: 'detail_order_dokter',
        foreignKey: 'order_id'
      })
    }

    return Order
}