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
    tableName: 'participants',
    timestamps: true,
    underscored: true,
  });
  
  Participant.associate = (models) => {
    Participant.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'ParticipantUser',
      onDelete: 'CASCADE',
    });

    Participant.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'ParticipatedPost',
      onDelete: 'CASCADE',
    });
  };


  return Participant;
};