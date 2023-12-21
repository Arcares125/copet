module.exports = (sequelize, DataTypes) =>{
    const Trainer = sequelize.define('Trainer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          penyedia_id: {
            type: DataTypes.INTEGER,
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
            type: DataTypes.INTEGER,
            allowNull: false
          },
          harga: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          lokasi: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          is_acc: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 'false'
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
        tableName: 'trainer',
        timestamps: true,
        paranoid: true
    })

    Trainer.associate = (models) =>{
      Trainer.belongsTo(models.PenyediaJasa, {
        as: 'role_trainer',
        foreignKey: 'penyedia_id'
      });

      Trainer.hasMany(models.DetailOrderTrainer, {
        as: 'detail_order_trainer',
        foreignKey: 'trainer_id'
      })
    }

    return Trainer
}