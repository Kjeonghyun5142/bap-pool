// bap-pool-backend/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');
const app = express();

// ⭐️⭐️⭐️ Socket.IO를 위한 HTTP 서버 및 Socket.IO 불러오기 ⭐️⭐️⭐️
const http = require('http');
const server = http.createServer(app); // Express 앱을 HTTP 서버로 감쌉니다.
const { Server } = require('socket.io'); // Socket.IO Server 클래스 불러오기
const jwt = require('jsonwebtoken'); // Socket.IO 인증에 JWT 사용

// chatController에서 saveChatMessage 함수를 가져옵니다.
const { saveChatMessage } = require('./controllers/chatController');
const JWT_SECRET = process.env.JWT_SECRET; // JWT_SECRET은 .env에서 가져옵니다.

// JWT_SECRET이 설정되지 않았을 경우 앱 종료
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

// ⭐️⭐️⭐️ Socket.IO 서버 설정 ⭐️⭐️⭐️
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // 프론트엔드 개발 서버 주소
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정 (HTTP 요청용)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// 라우트 불러오기
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');
const zoneRouter = require('./routes/zones');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const chatRouter = require('./routes/chat'); // ⭐️⭐️⭐️ 채팅 라우터 불러오기 ⭐️⭐️⭐️

// 라우트 연결
app.use('/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/zones', zoneRouter);
app.use('/api/users', usersRouter);
app.use('/api', commentsRouter); // /api/posts/:postId/comments, /api/comments/:id 형식
app.use('/api/chat', chatRouter); // ⭐️⭐️⭐️ 채팅 라우터 연결 ⭐️⭐️⭐️

// 기본 API 응답 (HTML 파일을 사용하지 않으므로)
app.get('/', (req, res) => {
  res.json({ message: '🚀 bap-pool 백엔드 API 서버가 실행 중입니다!' });
});

// 테스트용 유저 생성 라우트
app.post('/test-user', async (req, res) => {
  try {
    const user = await db.User.create({
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      nickname: '테스트유저',
      dormitory: 'B동',
    });
    res.status(201).json({ message: '테스트 유저 생성 성공', user });
  } catch (err) {
    console.error('❌ 테스트 유저 생성 실패:', err.stack);
    res.status(500).json({ error: '테스트 유저 생성 실패' });
  }
});

// 테스트용 게시글 생성 라우트
app.post('/test-post', async (req, res) => {
  try {
    const user = await db.User.findByPk(1);
    if (!user) {
      return res.status(400).json({ error: '유효한 writer_id (ID: 1) 유저가 없습니다. 먼저 테스트 유저를 생성하세요.' });
    }

    let zoneId = null;
    try {
      const existingZone = await db.Zone.findByPk(1);
      if (!existingZone) {
        const newZone = await db.Zone.create({ name: '테스트존', address: '테스트 주소 123' });
        zoneId = newZone.id;
        console.log('✅ 테스트 Zone 자동 생성:', newZone.name);
      } else {
        zoneId = existingZone.id;
        console.log('✅ 기존 테스트 Zone 사용:', existingZone.name);
      }
    } catch (zoneErr) {
      console.warn('⚠️ 테스트 Zone 생성/조회 중 경고:', zoneErr.message);
    }

    const post = await db.Post.create({
      title: '테스트 게시글',
      content: '이것은 API를 통해 생성된 테스트 게시글입니다.',
      min_price: 15000,
      deadline: new Date(new Date().setHours(new Date().getHours() + 24)),
      writer_id: user.id,
      current_participants_count: 0,
      zone_id: zoneId,
    });
    res.status(201).json({ message: '테스트 게시글 생성 성공', post });
  } catch (err) {
    console.error('❌ 테스트 게시글 생성 실패:', err.stack);
    res.status(500).json({ error: '게시글 생성 실패' });
  }
});


// ⭐️⭐️⭐️ Socket.IO 인증 미들웨어 (WebSockets 연결 전 토큰 검증) ⭐️⭐️⭐️
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token; // 클라이언트에서 'auth: { token: JWT_TOKEN }'으로 토큰을 보냄

  if (!token) {
    console.warn('Socket.IO 연결 거부: 토큰 없음');
    return next(new Error('인증 토큰이 제공되지 않았습니다.'));
  }

  try {
    // 토큰 검증 및 사용자 정보 추출
    const decoded = jwt.verify(token, JWT_SECRET);
    // Socket 객체에 사용자 정보 주입
    socket.user = decoded;
    console.log(`Socket.IO 연결 인증 성공: User ID ${decoded.id}`);
    next();
  } catch (err) {
    console.warn('Socket.IO 연결 거부: 유효하지 않은 토큰', err.message);
    next(new Error('유효하지 않은 인증 토큰입니다.'));
  }
});

// ⭐️⭐️⭐️ Socket.IO 연결 이벤트 핸들러 ⭐️⭐️⭐️
io.on('connection', (socket) => {
  console.log(`User connected to Socket.IO: ${socket.user.nickname} (ID: ${socket.user.id})`);

  // 사용자를 자신의 ID를 기반으로 하는 Private Room에 조인시킵니다.
  // 이는 특정 사용자에게만 메시지를 보내거나, 사용자가 접속 중인 모든 장치에 메시지를 보낼 때 유용합니다.
  socket.join(socket.user.id.toString());
  console.log(`User ${socket.user.id} joined private room: ${socket.user.id.toString()}`);

  // 'joinRoom' 이벤트: 클라이언트가 특정 채팅방에 참여 요청 시
  // 클라이언트는 특정 채팅방에 접속하기 위해 이 이벤트를 보냅니다.
  socket.on('joinRoom', async (chatRoomId) => {
    // 1. 해당 채팅방이 실제로 존재하는지 확인
    const chatRoom = await db.ChatRoom.findByPk(chatRoomId);
    if (!chatRoom) {
        console.warn(`User ${socket.user.id} attempted to join non-existent room: ${chatRoomId}`);
        socket.emit('roomError', { message: '채팅방을 찾을 수 없습니다.' });
        return;
    }

    // 2. 현재 사용자가 이 채팅방의 유효한 참여자인지 확인
    if (chatRoom.user1_id !== socket.user.id && chatRoom.user2_id !== socket.user.id) {
        console.warn(`User ${socket.user.id} attempted to join room ${chatRoomId} without permission.`);
        socket.emit('roomError', { message: '이 채팅방에 참여할 권한이 없습니다.' });
        return;
    }

    // 3. Socket.IO Room에 조인
    socket.join(chatRoomId.toString());
    console.log(`User ${socket.user.id} joined chat room: ${chatRoomId}`);
    socket.emit('joinedRoom', { chatRoomId, message: `채팅방 ${chatRoomId}에 입장했습니다.` });

    // (선택 사항) 해당 방의 이전 메시지를 클라이언트에게 로드
    // 실제 앱에서는 getChatMessages API를 통해 미리 로드하는 것이 더 효율적일 수 있습니다.
  });

  // 'chatMessage' 이벤트: 클라이언트로부터 메시지 수신 시
  socket.on('chatMessage', async ({ chatRoomId, content }) => {
    try {
      if (!content || content.trim() === '') {
        socket.emit('messageError', { message: '메시지 내용을 입력해주세요.' });
        return;
      }
      if (!chatRoomId) {
        socket.emit('messageError', { message: '채팅방 ID가 누락되었습니다.' });
        return;
      }

      // 메시지를 데이터베이스에 저장합니다.
      // saveChatMessage는 chatController에서 export된 함수입니다.
      const savedMessage = await saveChatMessage({
        chatRoomId: chatRoomId,
        senderId: socket.user.id,
        content: content,
      });

      // 메시지를 해당 채팅방의 모든 클라이언트에게 전송합니다.
      // `to(chatRoomId.toString())`를 사용하여 특정 방에만 보냅니다.
      io.to(chatRoomId.toString()).emit('newChatMessage', savedMessage);
      console.log(`Message sent to room ${chatRoomId} from ${socket.user.nickname}: ${content}`);

    } catch (error) {
      console.error(`Error handling chatMessage from ${socket.user.id} for room ${chatRoomId}:`, error.message);
      socket.emit('messageError', { message: `메시지 전송 실패: ${error.message}` });
    }
  });

  // 연결 해제 시
  socket.on('disconnect', () => {
    console.log(`User disconnected from Socket.IO: ${socket.user.nickname} (ID: ${socket.user.id})`);
    // 사용자가 참여했던 모든 방에서 자동으로 나갑니다.
  });

  // Socket.IO 오류 처리
  socket.on('error', (err) => {
    console.error(`Socket.IO error for user ${socket.user.id}:`, err.message);
    // 클라이언트에게 오류를 보낼 수 있습니다.
    socket.emit('serverError', { message: '서버 측에서 오류가 발생했습니다.' });
  });
});


// 데이터베이스 연결 및 서버 시작 로직
const PORT = process.env.PORT || 3000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    // 새 테이블(chat_rooms, chat_messages) 생성을 위해 alter: true 유지
    return db.sequelize.sync({ force: false, alter: true });
  })
  .then(() => {
    console.log('✅ DB 테이블 동기화 완료');
    // ⭐️⭐️⭐️ app.listen 대신 server.listen을 사용합니다. ⭐️⭐️⭐️
    // Socket.IO가 Express HTTP 서버 위에서 동작하도록 합니다.
    server.listen(PORT, () => {
      console.log(`🚀 서버가 http://localhost:${PORT}에서 실행 중`);
      console.log(`🌐 Socket.IO는 ws://localhost:${PORT}에서 대기 중`);
    });
  })
  .catch((err) => {
    console.error('❌ 서버 시작 실패 (DB 연결/동기화 문제):', err.stack);
    process.exit(1);
  });

process.on('uncaughtException', (err) => {
  console.error('❗️ 예상치 못한 예외 발생 (Uncaught Exception):', err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❗️ 처리되지 않은 Promise 거부 (Unhandled Rejection):', promise, '이유:', reason.stack || reason);
});
