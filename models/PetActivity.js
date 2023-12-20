module.exports = (sequelize, DataTypes) =>{
    const PetActivity = sequelize.define('PetActivity', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
          tanggal_aktivitas: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          mulai_aktivitas: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          akhir_aktivitas: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          isAllDay: {
            type: DataTypes.BOOLEAN,
            allowNull: true
          },
          background: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          description: {
            type: DataTypes.STRING(255),
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
        tableName: 'pet_activity',
        timestamps: true,
        paranoid: true
    })
    return PetActivity
}