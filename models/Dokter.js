module.exports = (sequelize, DataTypes) =>{
    const Dokter = sequelize.define('Dokter', {
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
            type: DataTypes.STRING(255),
            allowNull: false
          },
          spesialis: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          pengalaman: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          harga: {
            type: DataTypes.INTEGER,
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
        tableName: 'dokter',
        timestamps: true,
        paranoid: true
    })

    Dokter.associate = (models) =>{
      Dokter.belongsTo(models.PenyediaJasa, {
        as: 'role_dokter',
        foreignKey: 'penyedia_id'
      })
    }

    return Dokter
}