// bap-pool-backend/controllers/chatController.js

const db = require('../models');
const { Op } = require('sequelize'); // Sequelize Operator (Op) 사용을 위해 불러옵니다.

// 새 채팅방 생성 또는 기존 채팅방 조회
const createOrGetChatRoom = async (req, res) => {
  try {
    const user1Id = req.user.id; // 현재 로그인된 사용자 (req.user는 authMiddleware에서 설정)
    const { targetUserId } = req.body; // 대화 상대방의 사용자 ID

    // 1. 필수 필드 유효성 검사
    if (!targetUserId) {
      return res.status(400).json({ message: '대화 상대방의 사용자 ID가 필요합니다.' });
    }

    // 2. 자신과의 채팅방 생성 방지
    if (user1Id === parseInt(targetUserId)) {
      return res.status(400).json({ message: '자기 자신과는 채팅방을 만들 수 없습니다.' });
    }

    // 3. targetUserId가 존재하는 유저인지 확인
    const targetUser = await db.User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: '대화 상대방을 찾을 수 없습니다.' });
    }

    // 4. 기존 채팅방 찾기 (user1_id와 user2_id의 순서에 관계없이 찾기)
    // Sequelize.literal을 사용하여 user1_id가 user2_id보다 작도록 정렬된 조건으로 검색합니다.
    const chatRoom = await db.ChatRoom.findOne({
      where: {
        [Op.or]: [
          { user1_id: user1Id, user2_id: targetUserId },
          { user1_id: targetUserId, user2_id: user1Id },
        ],
      },
    });

    if (chatRoom) {
      // 5. 기존 채팅방이 있으면 반환
      return res.status(200).json({ message: '기존 채팅방을 찾았습니다.', chatRoom });
    } else {
      // 6. 기존 채팅방이 없으면 새로 생성
      // user1_id는 항상 작은 ID, user2_id는 항상 큰 ID로 저장하여 중복 생성 방지
      const newUser1Id = Math.min(user1Id, targetUserId);
      const newUser2Id = Math.max(user1Id, targetUserId);

      const newChatRoom = await db.ChatRoom.create({
        user1_id: newUser1Id,
        user2_id: newUser2Id,
        type: 'direct', // 1:1 채팅
      });
      return res.status(201).json({ message: '새 채팅방이 생성되었습니다.', chatRoom: newChatRoom });
    }
  } catch (error) {
    console.error('❌ 채팅방 생성/조회 실패:', error.stack);
    res.status(500).json({ message: '채팅방 생성/조회 실패', error: error.message });
  }
};

// 사용자의 모든 채팅방 목록 조회
const getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id; // 현재 로그인된 사용자 ID

    const chatRooms = await db.ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
      include: [
        {
          model: db.User,
          as: 'User1',
          attributes: ['id', 'nickname', 'email'],
        },
        {
          model: db.User,
          as: 'User2',
          attributes: ['id', 'nickname', 'email'],
        },
      ],
      order: [['updated_at', 'DESC']], // 최신 메시지가 있는 방이 위로 오도록 정렬
    });

    res.status(200).json({ message: '채팅방 목록 조회 성공', chatRooms });
  } catch (error) {
    console.error('❌ 채팅방 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '채팅방 목록 조회 실패', error: error.message });
  }
};

// 특정 채팅방의 메시지 기록 조회
const getChatMessages = async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const userId = req.user.id; // 현재 로그인된 사용자 ID

    // 1. 채팅방 존재 여부 확인 및 사용자가 해당 채팅방의 참여자인지 확인
    const chatRoom = await db.ChatRoom.findByPk(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });
    }
    if (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId) {
      return res.status(403).json({ message: '이 채팅방의 메시지를 조회할 권한이 없습니다.' });
    }

    // 2. 메시지 기록 조회
    const messages = await db.ChatMessage.findAll({
      where: { chat_room_id: chatRoomId },
      include: [
        {
          model: db.User,
          as: 'Sender', // ChatMessage 모델의 associate에서 설정된 alias
          attributes: ['id', 'nickname', 'email'],
        },
      ],
      order: [['created_at', 'ASC']], // 오래된 메시지가 먼저 오도록 정렬
    });

    res.status(200).json({ message: '채팅 메시지 조회 성공', messages });
  } catch (error) {
    console.error('❌ 채팅 메시지 조회 실패:', error.stack);
    res.status(500).json({ message: '채팅 메시지 조회 실패', error: error.message });
  }
};

// Socket.IO를 통한 메시지 전송 로직 (HTTP API 아님, 별도로 처리)
// 이 함수는 실제 HTTP API 라우트가 아니며, Socket.IO 이벤트 핸들러에서 사용될 수 있습니다.
// 여기서는 메시지를 DB에 저장하는 역할만 합니다.
const saveChatMessage = async ({ chatRoomId, senderId, content }) => {
  try {
    // 채팅방 존재 여부 확인 (Socket.IO 연결 시 이미 확인되었을 수 있음)
    const chatRoom = await db.ChatRoom.findByPk(chatRoomId);
    if (!chatRoom) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    }

    // 사용자가 해당 채팅방의 참여자인지 확인 (보안 강화)
    if (chatRoom.user1_id !== senderId && chatRoom.user2_id !== senderId) {
        throw new Error('이 채팅방에 메시지를 보낼 권한이 없습니다.');
    }

    const message = await db.ChatMessage.create({
      chat_room_id: chatRoomId,
      sender_id: senderId,
      content: content.trim(),
    });

    // 채팅방의 updated_at 필드를 최신으로 업데이트하여 채팅방 목록 정렬에 사용
    await chatRoom.update({ updated_at: new Date() });

    // 전송된 메시지에 Sender 정보를 포함하여 반환 (Socket.IO 클라이언트로 보낼 때 유용)
    const savedMessageWithSender = await db.ChatMessage.findByPk(message.id, {
        include: {
            model: db.User,
            as: 'Sender',
            attributes: ['id', 'nickname', 'email'],
        },
    });

    return savedMessageWithSender; // 저장된 메시지 객체를 반환
  } catch (error) {
    console.error('❌ 메시지 저장 실패:', error.stack);
    throw new Error('메시지 저장 중 오류 발생: ' + error.message);
  }
};


module.exports = {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
  saveChatMessage, // Socket.IO 핸들러에서 사용할 함수도 export
};
