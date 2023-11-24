module.exports = (sequelize, DataTypes) =>{
    const Hotel = sequelize.define('Hotel', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          toko_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          tipe_hotel: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          fasilitas: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          harga: {
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
        tableName: 'hotel',
        timestamps: true,
        paranoid: true
    })

    Hotel.associate = (models) =>{
      Hotel.hasMany(models.DetailOrderHotel, {
        as: 'detail_order_hotel',
        foreignKey: 'hotel_id'
      })
    }
    
    return Hotel
}