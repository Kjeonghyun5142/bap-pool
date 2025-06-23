// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models'); // User 모델을 가져오기 위함

const authMiddleware = async (req, res, next) => {
  // 1. 요청 헤더에서 Authorization 필드 추출
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 제공되지 않았거나 형식이 올바르지 않습니다.' });
  }

  // 'Bearer ' 접두사를 제거하고 실제 토큰만 추출
  const token = authHeader.split(' ')[1];

  try {
    // 2. 토큰 유효성 검사 및 정보 디코딩
    // process.env.JWT_SECRET는 로그인 시 토큰 생성에 사용했던 것과 동일해야 합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 토큰에서 추출한 ID로 사용자 정보를 데이터베이스에서 조회 (선택 사항이지만, 최신 사용자 정보 확인에 유용)
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다 (사용자를 찾을 수 없음).' });
    }

    // 4. `req` 객체에 사용자 정보 추가
    // 이렇게 하면 이후 컨트롤러에서 req.user.id, req.user.nickname 등으로 접근 가능
    req.user = user; 
    // 또는 간단히 req.userId = decoded.id; 로 사용할 수도 있습니다.

    // 5. 다음 미들웨어 또는 컨트롤러로 요청 전달
    next();

  } catch (error) {
    // 토큰이 만료되었거나 변조된 경우
    console.error('JWT 인증 실패:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '인증 토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ message: '유효하지 않은 인증 토큰입니다.' });
  }
};

module.exports = authMiddleware;