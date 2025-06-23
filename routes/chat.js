// bap-pool-backend/routes/chat.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // 인증 미들웨어

// chatController에서 필요한 함수들을 가져옵니다.
const {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
} = require('../controllers/chatController'); // saveChatMessage는 Socket.IO에서 직접 사용되므로 여기서는 제외

// ⭐️ 라우트 정의 ⭐️

// POST /api/chat/rooms - 새 채팅방 생성 또는 기존 채팅방 조회 (1:1 채팅 시작)
// body: { targetUserId: <상대방_ID> }
router.post('/rooms', authMiddleware, createOrGetChatRoom);

// GET /api/chat/rooms - 현재 로그인된 사용자의 모든 채팅방 목록 조회
router.get('/rooms', authMiddleware, getUserChatRooms);

// GET /api/chat/rooms/:chatRoomId/messages - 특정 채팅방의 메시지 기록 조회
router.get('/rooms/:chatRoomId/messages', authMiddleware, getChatMessages);

module.exports = router;
