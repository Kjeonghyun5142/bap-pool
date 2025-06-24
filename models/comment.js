module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'comments',
    timestamps: true, // createdAt, updatedAt 자동 생성
    underscored: true, // created_at, updated_at 형식으로 컬럼 생성
  });

  Comment.associate = (models) => {
    // 게시글과의 관계 설정
    Comment.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'Post',
      onDelete: 'CASCADE',
    });

    // 작성자(User)와의 관계 설정
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'User',
      onDelete: 'CASCADE',
    });
  };

  return Comment;
};
