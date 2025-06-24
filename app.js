require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());

// env에서 JWT_SECRET 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

// JWT_SECRET이 설정되지 않았을 경우 앱 종료
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

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

// 라우트 연결
app.use('/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/zones', zoneRouter);
app.use('/api/users', usersRouter);
app.use('/api', commentsRouter);

// 기본 API 응답
app.get('/', (req, res) => {
  res.json({ message: '🚀 bap-pool 백엔드 API 서버가 실행 중입니다!' });
});

const PORT = process.env.PORT || 3000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    return db.sequelize.sync({ force: false, alter: true });
  })
  .then(() => {
    console.log('✅ DB 테이블 동기화 완료');
    // server.listen 대신 app.listen 사용 (Socket.IO 미사용 시)
    app.listen(PORT, () => {
      console.log(`🚀 서버가 http://localhost:${PORT}에서 실행 중`);
    });
  })
  .catch((err) => {
    console.error('❌ 서버 시작 실패 (DB 연결/동기화 문제):', err.stack);
    process.exit(1);
  });

// 예외 처리
process.on('uncaughtException', (err) => {
  console.error('❗️ 예상치 못한 예외 발생 (Uncaught Exception):', err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❗️ 처리되지 않은 Promise 거부 (Unhandled Rejection):', promise, '이유:', reason.stack || reason);
});
