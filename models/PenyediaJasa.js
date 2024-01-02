module.exports = (sequelize, DataTypes) =>{
    const PenyediaJasa = sequelize.define('PenyediaJasa', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          uid: {
            type: DataTypes.STRING(255),
            allowNull: true
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
            type: DataTypes.ENUM,
            values: ['Dokter', 'Trainer', 'Toko'],
            allowNull: true
          },
          status: {
            type: DataTypes.STRING(50),
            allowNull: true
          },
          is_acc: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
          },
          refreshToken: {
            type: DataTypes.TEXT,
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
        tableName: 'penyedia_jasa',
        timestamps: true,
        paranoid: true
    })
    return PenyediaJasa
}