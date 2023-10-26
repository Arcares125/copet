module.exports = (sequelize, DataTypes) =>{
    const Toko = sequelize.define('Toko', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          foto: {
            type: DataTypes.BLOB('long'),
            allowNull: true,
            // defaultValue: 
          },
          fasilitas: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          deskripsi: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          lokasi: {
            type: DataTypes.STRING(255),
            allowNull: true
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
        tableName: 'tokos',
        timestamps: true,
        paranoid: true
    })
    return Toko
}