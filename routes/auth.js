//auth.js
    // bap-pool-backend/routes/auth.js

    const express = require('express');
    
    const router = express.Router();
    const authController = require('../controllers/authController');
    // bcrypt와 jwt는 이제 userController.js에서 직접 사용하므로 여기서 제거합니다.
    // const bcrypt = require('bcryptjs');
    // const jwt = require('jsonwebtoken');
    // const db = require('../models');

    // ⭐️ userController에서 필요한 함수들을 가져옵니다. ⭐️
    const { createUser, loginUser } = require('../controllers/userController');

    // JWT_SECRET은 app.js에서 dotenv로 로드되며, loginUser 함수 내에서 직접 사용됩니다.
    // 여기서는 이 라우터 파일에 JWT_SECRET을 직접 사용할 필요가 없습니다.

    // 회원가입 라우트
    // POST /auth/signup (createUser 함수는 이제 userController에서 가져옵니다)
    router.post('/signup', createUser);

    // 로그인 라우트
    // POST /auth/login (loginUser 함수는 이제 userController에서 가져옵니다)
    router.post('/login', loginUser);

    // 로그아웃 라우트 (기존 코드 유지)
    // POST /auth/logout
    router.post('/logout', (req, res) => {
      try {
        res.status(200).json({ message: '로그아웃 요청이 성공적으로 처리되었습니다.' });
      } catch (error) {
        console.error('❌ 로그아웃 API 오류:', error.stack);
        res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.', error: error.message });
      }
    });
   router.post('/login', authController.login);
    module.exports = router;
    