module.exports = (sequelize, DataTypes) =>{
    const Review = sequelize.define('Review', {
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
          customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          toko_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          rating: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          ulasan: {
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
        tableName: 'review',
        timestamps: true,
        paranoid: true
    })

    Review.associate = (models) =>{

      Review.belongsTo(models.Order, {
        as: 'orders',
        foreignKey: 'order_id'
      })

    }
    
    return Review
}