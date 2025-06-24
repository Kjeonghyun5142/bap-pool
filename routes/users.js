    // bap-pool-backend/routes/users.js

    const express = require('express');
    const router = express.Router();
    const authMiddleware = require('../middlewares/authMiddleware'); // 인증 미들웨어

    // userController에서 필요한 함수들을 가져옵니다.
    const { getUsers, getMe, updateMe } = require('../controllers/userController');
    const db = require('../models');
    const { Post } = db;



    // ⭐️ 라우트 정의 ⭐️

    // GET /api/users - 모든 사용자 목록 조회 (관리자용 또는 개발용)
    router.get('/', getUsers);

    // GET /api/users/me - 로그인된 사용자 본인 정보 조회 (인증 필요)
    router.get('/me', authMiddleware, getMe);

    // PATCH /api/users/me - 로그인된 사용자 본인 정보 수정 (인증 필요)
   router.patch('/me', authMiddleware, updateMe);


    // GET /api/users/me/posts - 내가 쓴 게시글 조회 (인증 필요)
    router.get('/me/posts', authMiddleware, async (req, res) => {
  try {
    console.log('✅ req.user:', req.user);
    const userId = req.user.id;

    const posts = await Post.findAll({
      where: { writer_id: userId },
      include: [
        {
          model: db.Zone,
          as: 'Zone',
          attributes: ['id', 'name'],
        },
        {
          model: db.User,
          as: 'Writer',
          attributes: ['nickname'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // plain object로 변환 (선택)
    const plainPosts = posts.map(post => post.toJSON());
    res.json({ posts: plainPosts });
  } catch (error) {
    console.error('내가 쓴 글 조회 실패:', error);
    res.status(500).json({ message: '게시글 조회 실패', error: error.message });
  }
});



    module.exports = router;
    