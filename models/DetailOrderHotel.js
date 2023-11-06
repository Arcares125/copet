module.exports = (sequelize, DataTypes) =>{
    const DetailOrderHotel = sequelize.define('DetailOrderHotel', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          hotel_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          tanggal_masuk: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          tanggal_keluar: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          metode_penjemputan: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          discount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        tableName: 'detail_order_hotel',
        timestamps: true,
        paranoid: true
    })
    return DetailOrderHotel
}