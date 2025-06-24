module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    min_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    current_participants_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    writer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    /*created_at: { // ⭐️⭐️⭐️ created_at, updated_at 컬럼 추가 (timestamps: false 설정 시) ⭐️⭐️⭐️
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    }*/
  }, {
    tableName: 'posts', // 실제 데이터베이스 테이블 이름
    underscored: true,
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at', 

  });

  Post.associate = (db) => {
    Post.belongsTo(db.User, { foreignKey: 'writer_id', as: 'Writer' });
    Post.hasMany(db.Participant, { foreignKey: 'post_id', as: 'Participants' });
    Post.belongsTo(db.Zone, { foreignKey: 'zone_id', as: 'Zone' });

    // ✅ 여기가 중요: Comment 관계는 이 안에 있어야 합니다.
    Post.hasMany(db.Comment, {
      foreignKey: 'post_id',
      as: 'Comments',
      onDelete: 'CASCADE',
    });
  };

  return Post;
};
