module.exports = (sequelize, DataTypes) =>{
    const Admin = sequelize.define('Admin', {
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
          email: {
            type: DataTypes.STRING(255),
            allowNull:false,
          },
          password: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          refreshToken: {
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
        tableName: 'admins',
        timestamps: true,
        paranoid: true
    })
    return Admin
}