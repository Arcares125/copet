module.exports = (sequelize, DataTypes) =>{
    const DetailOrderTrainer = sequelize.define('DetailOrderTrainer', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          trainer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          tanggal_pertemuan: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          jam_pertemuan: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          durasi_pertemuan: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          discount: {
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