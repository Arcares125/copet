module.exports = (sequelize, DataTypes) =>{
    const OrderGrooming = sequelize.define('OrderGrooming', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          alamat: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          tanggal_grooming: {
            type: DataTypes.DATE,
            allowNull: false
          },
          status_grooming: {
            type: DataTypes.STRING(20),
            values: ['Male', 'Female'],
            allowNull: false
          },
          metode_pengiriman: {
            type: DataTypes.STRING(10),
            allowNull: false
          },
          metode_pembayaran: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          status_pembayaran: {
            type: DataTypes.STRING(255),
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
        tableName: 'order_grooming',
        timestamps: true,
        paranoid: true
    })
    return OrderGrooming
}