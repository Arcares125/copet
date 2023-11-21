module.exports = (sequelize, DataTypes) =>{
    const VirtualAccount = sequelize.define('VirtualAccount', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          // order_id: {
          //   type: DataTypes.INTEGER,
          //   allowNull: false
          // },
          nama: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          kode: {
            type: DataTypes.STRING(50),
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
        tableName: 'virtual_account',
        timestamps: true,
        paranoid: true
    })

    // VirtualAccount.associate = (models) =>{
    //   VirtualAccount.hasMany(models.Order, {
    //     as: 'virtual_account_order',
    //     foreignKey: 'virtual_id'
    //   })
    // }
    

    return VirtualAccount
}