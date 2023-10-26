module.exports = (sequelize, DataTypes) =>{
    const Grooming = sequelize.define('Grooming', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          } ,
          tipe: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          fasilitas: {
            type: DataTypes.STRING(255),
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
        tableName: 'groomings',//underscore
        timestamps: true,
        paranoid: true
    })
    return Grooming
}