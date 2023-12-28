module.exports = (sequelize, DataTypes) =>{
    const HewanPeliharaan = sequelize.define('HewanPeliharaan', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          nama_hewan: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          jenis_hewan: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          size_hewan: {
            type: DataTypes.STRING(13),
            allowNull: false
          },
          umur_hewan: {
            type: DataTypes.INTEGER(2),
            allowNull: false
          },
          gender: {
            type: DataTypes.STRING(255),
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
        tableName: 'hewan_peliharaan',
        timestamps: true,
        paranoid: true
    })

    HewanPeliharaan.associate = (models) => {
        HewanPeliharaan.belongsTo(models.User, {
            as: 'pemilik_hewan',
            foreignKey: 'user_id'
        })

        HewanPeliharaan.hasMany(models.PetActivity, {
          as: 'aktivitas_hewan',
          foreignKey: 'hewan_id'
        })
    }

    return HewanPeliharaan
}