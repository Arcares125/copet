module.exports = (sequelize, DataTypes) =>{
    const Dokter = sequelize.define('Dokter', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          nama_dokter: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          spesialis: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          pengalaman: {
            type: DataTypes.INT,
            allowNull: false
          },
          harga: {
            type: DataTypes.INT,
            allowNull: false
          },
          alumni: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          lokasi_praktek: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          no_str: {
            type: DataTypes.STRING(16),
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
        tableName: 'dokters',
        timestamps: true,
        paranoid: true
    })
    return User
}