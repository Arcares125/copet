module.exports = (sequelize, DataTypes) =>{
    const DetailPetActivity = sequelize.define('DetailPetActivity', {
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          hewan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          activity_mulai: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          activity_akhir: {
            type: DataTypes.DATE,
            allowNull:false,
          },
    }, {
        tableName: 'detail_pet_activity',
        timestamps: true,
        paranoid: true
    })
    return DetailPetActivity
}