module.exports = (sequelize, DataTypes) =>{
    const Chat = sequelize.define('Chat', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          status: {
            type: DataTypes.STRING(50),
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
        tableName: 'chat',
        timestamps: true,
        paranoid: true
    })

    Chat.associate = (models) =>{
      Chat.belongsTo(models.Order, {
        as: 'chat',
        foreignKey: 'order_id'
      })
    }

    return Chat
}