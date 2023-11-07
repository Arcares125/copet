module.exports = (sequelize, DataTypes) =>{
    const VirtualAccount = sequelize.define('VirtualAccount', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
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
    return VirtualAccount
}