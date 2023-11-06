module.exports = (sequelize, DataTypes) =>{
    const Grooming = sequelize.define('Grooming', {
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
          tipe: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          fasilitas: {
            type: DataTypes.STRING(255),
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
        tableName: 'grooming',
        timestamps: true,
        paranoid: true
    })
    return Grooming
}