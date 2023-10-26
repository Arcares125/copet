module.exports = (sequelize, DataTypes) =>{
    const Hotel = sequelize.define('Hotel', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
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
            type: DataTypes.INT,
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
        tableName: 'hotels',
        timestamps: true,
        paranoid: true
    })
    return Hotel
}