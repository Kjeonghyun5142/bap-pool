// models/participant.js
module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Participants',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id']
      }
    ]
  });

  // 관계는 models/index.js 또는 이 파일에서 설정
  // Participant.associate = (models) => {
  //   Participant.belongsTo(models.User, { foreignKey: 'user_id' });
  //   Participant.belongsTo(models.Post, { foreignKey: 'post_id' });
  // };

  return Participant;
};