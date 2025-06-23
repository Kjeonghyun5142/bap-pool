const jwt = require('jsonwebtoken');
const db = require('../models');

const authMiddleware = async (req, res, next) => {
  // ✅ 쿠키에서 token 추출
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다 (사용자를 찾을 수 없음).' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT 인증 실패:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '인증 토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ message: '유효하지 않은 인증 토큰입니다.' });
  }
};

module.exports = authMiddleware;
