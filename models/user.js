module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dormitory: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'users',
  });

  // ✅ Post와의 관계를 명시
  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'writer_id',
      as: 'Posts',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return User;
};
