module.exports = (sequelize, DataTypes) =>{
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          } ,
          nama: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          email: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          noTelp: {
            type: DataTypes.STRING(13),
            allowNull: false
          },
          gender: {
            type: DataTypes.ENUM,
            values: ['Male', 'Female'],
            allowNull: false
          },
          password: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          refreshToken: {
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
        tableName: 'users',
        timestamps: true,
        paranoid: true
    })
    return User
}