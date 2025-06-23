// bap-pool-backend/controllers/userController.js

const bcrypt = require('bcryptjs'); // 비밀번호 해싱을 위한 라이브러리
const jwt = require('jsonwebtoken'); // JWT 토큰 발급을 위한 라이브러리 (loginUser에서 사용)
const db = require('../models'); // db 객체를 통해 모든 모델 접근

// .env 파일에서 JWT_SECRET 환경 변수 로드
// 이 파일에서 직접 JWT_SECRET을 사용할 경우 필요하지만,
// 일반적으로는 auth.js 라우트 파일에서만 JWT_SECRET을 관리합니다.
// 여기서는 loginUser에서 필요하므로 추가합니다.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  // 이 컨트롤러가 호출될 때 이미 앱이 시작되었으므로 process.exit은 app.js에서만 권장
}

// 회원가입 처리 (createUser)
// POST /auth/signup
const createUser = async (req, res) => {
  try {
    const { email, password, nickname, dormitory } = req.body;

    // 필수 필드 유효성 검사
    if (!email || !password || !nickname || !dormitory) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    // 이메일 형식 검사 (간단 예시)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 형식을 입력해주세요.' });
    }
    // 비밀번호 길이 검사 (예시)
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // 이메일 중복 확인
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds 10

    // 새로운 사용자 생성
    const user = await db.User.create({
      email,
      password: hashedPassword,
      nickname,
      dormitory,
    });

    // ⭐️ 회원가입 시 JWT 토큰 발급 제거: 로그인 시에 토큰을 발급하는 것이 일반적입니다. ⭐️
    res.status(201).json({
      message: '회원가입 성공',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        dormitory: user.dormitory,
      },
    });
  } catch (error) {
    console.error('❌ 회원가입 오류:', error.stack);
    res.status(500).json({ message: '회원가입 실패: 서버 오류', error: error.message });
  }
};

// 로그인 처리 (loginUser)
// POST /auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 이메일로 사용자 검색
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 발급
    const token = jwt.sign(
      { id: user.id, email: user.email, nickname: user.nickname }, // 토큰에 포함할 정보
      JWT_SECRET, // .env에서 로드한 비밀 키
      { expiresIn: '1h' } // 1시간 동안 유효
    );

    res.status(200).json({
      message: '로그인 성공',
      token, // JWT 토큰 반환
    });
  } catch (error) {
    console.error('❌ 로그인 오류:', error.stack);
    res.status(500).json({ message: '로그인 실패: 서버 오류', error: error.message });
  }
};

// 사용자 목록 조회 (getUsers)
// GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'email', 'nickname', 'dormitory', 'created_at'] // 비밀번호 제외
    });
    res.status(200).json({ message: '사용자 목록 조회 성공', users });
  } catch (error) {
    console.error('❌ 사용자 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '사용자 목록 조회 실패', error: error.message });
  }
};

// 로그인된 사용자 본인의 정보 조회 (getMe)
// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware를 통해 JWT에서 추출된 사용자 ID

    // 비밀번호는 보안상 반환하지 않습니다.
    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'email', 'nickname', 'dormitory', 'created_at', 'updated_at']
    });

    if (!user) {
      // 이론적으로 authMiddleware를 통과했으므로 이 경우는 없어야 하지만, 만약을 대비
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '사용자 정보 조회 성공', user });
  } catch (error) {
    console.error('❌ 사용자 정보 조회 실패:', error.stack);
    res.status(500).json({ message: '사용자 정보 조회 실패', error: error.message });
  }
};

// 로그인된 사용자 본인의 정보 수정 (updateMe)
// PATCH /api/users/me
const updateMe = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware를 통해 JWT에서 추출된 사용자 ID
    const { nickname, dormitory, password } = req.body; // 변경 가능한 필드

    // 사용자 찾기
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const updatedFields = {};

    // 닉네임 변경 요청이 있을 경우
    if (nickname !== undefined && nickname !== null && String(nickname).trim() !== '') {
      updatedFields.nickname = String(nickname).trim();
    }

    // 기숙사/자취 위치 변경 요청이 있을 경우
    if (dormitory !== undefined && dormitory !== null && String(dormitory).trim() !== '') {
      updatedFields.dormitory = String(dormitory).trim();
    }

    // 비밀번호 변경 요청이 있을 경우
    if (password !== undefined && password !== null && String(password).trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ message: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
      }
      updatedFields.password = await bcrypt.hash(password, 10); // 새 비밀번호 해싱
    }

    // 업데이트할 필드가 없는 경우
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: '업데이트할 정보가 제공되지 않았습니다.' });
    }

    // 정보 업데이트
    await user.update(updatedFields);

    // 업데이트된 사용자 정보 반환 (보안상 비밀번호는 제외)
    res.status(200).json({
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        dormitory: user.dormitory
      }
    });
  } catch (error) {
    console.error('❌ 사용자 정보 업데이트 실패:', error.stack);
    res.status(500).json({ message: '사용자 정보 업데이트 실패', error: error.message });
  }
};

// 모든 컨트롤러 함수를 export 합니다.
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getMe,
  updateMe,
};
