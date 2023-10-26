module.exports = (sequelize, DataTypes) =>{
    const Trainer = sequelize.define('Trainer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          spesialis: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          pengalaman: {
            type: DataTypes.INT,
            allowNull: false
          },
          harga: {
            type: DataTypes.INT,
            allowNull: false
          },
          lokasi: {
            type: DataTypes.STRING(255),
            allowNull: false
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
        tableName: 'trainers',
        timestamps: true,
        paranoid: true
    })
    return Trainer
}