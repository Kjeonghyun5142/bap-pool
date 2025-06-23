// bap-pool-backend/models/comment.js

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: { // 댓글을 작성한 사용자 ID (외래 키)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    post_id: { // 댓글이 달린 게시글 ID (외래 키)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    }
  }, {
    tableName: 'comments', // 실제 DB 테이블 이름
    timestamps: false, // created_at, updated_at을 수동 관리하므로 false
  });

  Comment.associate = (models) => {
    // Comment는 한 명의 User에 의해 작성됩니다.
    Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'CommentAuthor', onDelete: 'CASCADE' });

    // Comment는 하나의 Post에 속합니다.
    Comment.belongsTo(models.Post, { foreignKey: 'post_id', as: 'PostComment', onDelete: 'CASCADE' });
  };

  return Comment;
};
