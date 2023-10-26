module.exports = (sequelize, DataTypes) =>{
    const Review = sequelize.define('Review', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          rating: {
            type: DataTypes.INT,
            allowNull: true
          },
          ulasan: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          // role: {
          //   type: DataTypes.ENUM,
          //   values: ['Pelanggan', 'Dokter', 'Trainer', 'Grooming']
          // }
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
        tableName: 'reviews',
        timestamps: true,
        paranoid: true
    })
    return Review
}