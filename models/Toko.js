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
            type: DataTypes.TEXT,
            allowNull: true,
            // defaultValue: 
          },
          // fasilitas: {
          //   type: DataTypes.STRING(255),
          //   allowNull: true
          // },
          deskripsi: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          lokasi: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          is_acc: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
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
      });

      Toko.hasMany(models.Hotel, {
        as: 'hotels',
        foreignKey: 'toko_id'
      });

      Toko.hasMany(models.Grooming, {
        as: 'groomings',
        foreignKey: 'toko_id'
      })
    }


    return Toko
}