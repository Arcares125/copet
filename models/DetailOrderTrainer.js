module.exports = (sequelize, DataTypes) =>{
    const DetailOrderTrainer = sequelize.define('DetailOrderTrainer', {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          trainer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          jam_pertemuan: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          durasi_pertemuan: {
            type: DataTypes.DATE,
            allowNull: false
          },
          diskon: {
            type: DataTypes.INTEGER,
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
        tableName: 'detail_order_trainer',
        timestamps: true,
        paranoid: true
    })
    return DetailOrderTrainer
}