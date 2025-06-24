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

  // 관계 설정은 한 번만 정의
  User.associate = (db) => {
    User.hasMany(db.Post, { foreignKey: 'writer_id', as: 'Posts', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    User.hasMany(db.Participant, { foreignKey: 'user_id', as: 'Participations' });
    User.hasMany(db.Comment, { foreignKey: 'user_id', as: 'Comments' });
  };

  return User;
};
