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
    return Chat
}