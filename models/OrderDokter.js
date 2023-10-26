module.exports = (sequelize, DataTypes) =>{
    const OrderDokter = sequelize.define('OrderDokter', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          tanggal_konsultasi: {
            type: DataTypes.DATE,
            allowNull: false
          },
          jam_konsultasi: {
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
        tableName: 'order_dokter',
        timestamps: true,
        paranoid: true
    })
    return OrderDokter
}