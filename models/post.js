// bap-pool-backend/models/post.js

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: { // ⭐️⭐️⭐️ ID 컬럼 (기본 키) 추가 ⭐️⭐️⭐️
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255), // STRING 길이를 명시하는 것이 좋습니다.
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true, // content는 null을 허용하는 것이 일반적입니다.
    },
    min_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false, // 마감일은 필수입니다.
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false, // 마감 여부도 항상 값이 있어야 합니다.
    },
    current_participants_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    writer_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // ⭐️⭐️⭐️ ON DELETE SET NULL과 호환되도록 true로 설정 ⭐️⭐️⭐️
      // references, onUpdate, onDelete는 associate 메서드에서 정의합니다.
    },
    zone_id: { // ⭐️⭐️⭐️ Zone 모델과의 관계를 위한 컬럼 추가 ⭐️⭐️⭐️
      type: DataTypes.INTEGER,
      allowNull: true, // Post가 특정 Zone에 속하지 않을 수도 있으므로 true로 설정
      // references, onUpdate, onDelete는 associate 메서드에서 정의합니다.
    },
    created_at: { // ⭐️⭐️⭐️ created_at, updated_at 컬럼 추가 (timestamps: false 설정 시) ⭐️⭐️⭐️
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
    tableName: 'posts', // 실제 데이터베이스 테이블 이름
    timestamps: false, // ⭐️⭐️⭐️ created_at, updated_at 컬럼을 수동 관리하므로 false ⭐️⭐️⭐️
    // createdAt: 'created_at', // timestamps: true 시 컬럼 이름 매핑
    // updatedAt: 'updated_at', // timestamps: true 시 컬럼 이름 매핑
  });

  // ⭐️⭐️⭐️ 모델 관계 정의 (associate 메서드) ⭐️⭐️⭐️
  Post.associate = (models) => {
    // Post (작성자) <-> User 관계: writer_id는 User의 id를 참조합니다.
    Post.belongsTo(models.User, { foreignKey: 'writer_id', as: 'Writer', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

    // Post <-> Zone 관계: zone_id는 Zone의 id를 참조합니다.
    Post.belongsTo(models.Zone, { foreignKey: 'zone_id', as: 'Zone', onDelete: 'SET NULL', onUpdate: 'CASCADE' }); // ⭐️ Zone 관계 추가 ⭐️

    // Post <-> Participant 관계: 게시글은 여러 참여자를 가질 수 있습니다.
    Post.hasMany(models.Participant, { foreignKey: 'post_id', as: 'Participants', onDelete: 'CASCADE' });
  };

  return Post;
};
