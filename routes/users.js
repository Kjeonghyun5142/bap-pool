    // bap-pool-backend/routes/users.js

    const express = require('express');
    const router = express.Router();
    const authMiddleware = require('../middlewares/authMiddleware'); // 인증 미들웨어

    // userController에서 필요한 함수들을 가져옵니다.
    const { getUsers, getMe, updateMe } = require('../controllers/userController');

    // ⭐️ 라우트 정의 ⭐️

    // GET /api/users - 모든 사용자 목록 조회 (관리자용 또는 개발용)
    router.get('/', getUsers);

    // GET /api/users/me - 로그인된 사용자 본인 정보 조회 (인증 필요)
    router.get('/me', authMiddleware, getMe);

    // PATCH /api/users/me - 로그인된 사용자 본인 정보 수정 (인증 필요)
    router.patch('/me', authMiddleware, updateMe);

    module.exports = router;
    