module.exports = (sequelize, DataTypes) =>{
    const DetailPetActivity = sequelize.define('DetailPetActivity', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          hewan_id: {
            type: DataTypes.INTEGER,
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