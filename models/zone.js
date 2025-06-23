module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'zones',
    timestamps: false,
  });

  Zone.associate = (models) => {
    Zone.hasMany(models.Post, { foreignKey: 'zone_id', as: 'posts' });
  };

  return Zone;
};