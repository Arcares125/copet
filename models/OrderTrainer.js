module.exports = (sequelize, DataTypes) =>{
    const OrderTrainer = sequelize.define('OrderTrainer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          tanggal_pertemuan: {
            type: DataTypes.DATE,
            allowNull: false
          },
          jam_pertemuan: {
            type: DataTypes.DATE,
            allowNull: false
          },
          status: {
            type: DataTypes.STRING(10),
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
          // role: {
          //   type: DataTypes.ENUM,
          //   values: ['Pelanggan', 'Dokter', 'Trainer', 'Grooming']
          // }
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
        tableName: 'order_trainer',
        timestamps: true,
        paranoid: true
    })
    return OrderTrainer
}