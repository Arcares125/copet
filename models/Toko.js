module.exports = (sequelize, DataTypes) =>{
    const Toko = sequelize.define('Toko', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          penyedia_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          foto: {
            type: DataTypes.BLOB('long'),//string 255
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
          jam_buka: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          jam_tutup: {
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
        tableName: 'toko',
        timestamps: true,
        paranoid: true
    })

    Toko.associate = (models) =>{
      Toko.belongsTo(models.PenyediaJasa, {
        as: 'role_toko',
        foreignKey: 'penyedia_id'
      })
    }

    return Toko
}