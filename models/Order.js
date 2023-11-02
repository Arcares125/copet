module.exports = (sequelize, DataTypes) =>{
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
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
        tableName: 'orders',
        timestamps: true,
        paranoid: true
    })
    return Order
}