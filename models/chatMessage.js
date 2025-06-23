// bap-pool-backend/models/chatMessage.js

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chat_room_id: { // 메시지가 속한 채팅방 ID (외래 키)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_rooms', // 'chat_rooms' 테이블을 참조합니다.
        key: 'id',
      },
    },
    sender_id: { // 메시지를 보낸 사용자 ID (외래 키)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 'users' 테이블을 참조합니다.
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
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
    tableName: 'chat_messages', // 실제 DB 테이블 이름
    timestamps: false, // created_at, updated_at을 수동 관리하므로 false
  });

  ChatMessage.associate = (models) => {
    // ChatMessage는 하나의 ChatRoom에 속합니다.
    ChatMessage.belongsTo(models.ChatRoom, { foreignKey: 'chat_room_id', as: 'ChatRoom', onDelete: 'CASCADE' });

    // ChatMessage는 한 명의 User에 의해 전송됩니다.
    ChatMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'Sender', onDelete: 'CASCADE' });
  };

  return ChatMessage;
};
