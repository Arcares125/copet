module.exports = (sequelize, DataTypes) =>{
    const DetailOrderGrooming = sequelize.define('DetailOrderGrooming', {
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
          grooming_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          tanggal_grooming: {
            type: DataTypes.DATE,
            allowNull:false,
          },
          alamat_pelanggan_grooming: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          metode_penjemputan_grooming: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          discount: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          quantity: {
            type: DataTypes.INTEGER,
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
        tableName: 'detail_order_grooming',
        timestamps: true,
        paranoid: true
    })

    DetailOrderGrooming.associate = (models) =>{
      DetailOrderGrooming.belongsTo(models.Grooming, {
        as: 'groomings',
        foreignKey: 'grooming_id'
      });

      DetailOrderGrooming.belongsTo(models.Order, {
        as: 'orders',
        foreignKey: 'order_id'
      });
    }

    return DetailOrderGrooming
}