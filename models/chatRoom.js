// bap-pool-backend/models/chatRoom.js

// ⭐️⭐️⭐️ Sequelize에서 Op (Operator)를 명시적으로 가져옵니다. ⭐️⭐️⭐️
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define('ChatRoom', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // 1:1 채팅방의 경우, 두 사용자의 ID를 저장합니다.
    user1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 'users' 테이블을 참조합니다.
        key: 'id',
      },
    },
    user2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 'users' 테이블을 참조합니다.
        key: 'id',
      },
    },
    // 채팅방의 유형 (예: 'direct', 'group', 'post_related' 등. 현재는 direct만 고려)
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'direct', // 기본값은 1:1 직접 대화
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
    tableName: 'chat_rooms', // 실제 DB 테이블 이름
    timestamps: false, // created_at, updated_at을 수동 관리하므로 false
    indexes: [
      // 두 사용자 ID의 조합이 고유하도록 인덱스 설정 (순서 무관)
      {
        unique: true,
        fields: ['user1_id', 'user2_id'],
        where: {
          // ⭐️⭐️⭐️ DataTypes.Op.and 대신 Op.and를 사용합니다. ⭐️⭐️⭐️
          [Op.and]: [
            sequelize.literal('LEAST(user1_id, user2_id) = user1_id'),
            sequelize.literal('GREATEST(user1_id, user2_id) = user2_id')
          ]
        }
      }
    ]
  });

  ChatRoom.associate = (models) => {
    // ChatRoom은 두 명의 User와 연결됩니다.
    ChatRoom.belongsTo(models.User, { foreignKey: 'user1_id', as: 'User1', onDelete: 'CASCADE' });
    ChatRoom.belongsTo(models.User, { foreignKey: 'user2_id', as: 'User2', onDelete: 'CASCADE' });

    // ChatRoom은 여러 ChatMessage를 가질 수 있습니다.
    ChatRoom.hasMany(models.ChatMessage, { foreignKey: 'chat_room_id', as: 'Messages', onDelete: 'CASCADE' });
  };

  return ChatRoom;
};
