module.exports = (sequelize, DataTypes) =>{
    const PenyediaJasa = sequelize.define('PenyediaJasa', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          email: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          no_telp: {
            type: DataTypes.STRING(13),
            allowNull: false
          },
          password: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          jenis_jasa: {
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
        tableName: 'penyedia_jasa',
        timestamps: true,
        paranoid: true
    })
    return PenyediaJasa
}