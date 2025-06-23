// routes/auth.js

const express = require('express');
const router = express.Router();

// ✅ userController에서 createUser와 loginUser를 가져옵니다.
const { createUser, loginUser } = require('../controllers/userController');

// POST /auth/signup - 회원가입
router.post('/signup', createUser);

// POST /auth/login - 로그인
router.post('/login', loginUser);

// POST /auth/logout - 로그아웃
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: '로그아웃 요청이 성공적으로 처리되었습니다.' });
  } catch (error) {
    console.error('❌ 로그아웃 오류:', error.stack);
    res.status(500).json({ message: '로그아웃 실패', error: error.message });
  }
});

module.exports = router;
