module.exports = (sequelize, DataTypes) =>{
    const DetailOrderDokter = sequelize.define('DetailOrderDokter', {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          dokter_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          diskon: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          durasi_konsultasi: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          jam_konsultasi: {
            type: DataTypes.DATE,
            allowNull:true,
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
        tableName: 'detail_order_dokter',
        timestamps: true,
        paranoid: true
    })
    return DetailOrderDokter
}