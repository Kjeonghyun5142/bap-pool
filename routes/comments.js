// bap-pool-backend/routes/comments.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // 인증 미들웨어

// commentController에서 필요한 함수들을 가져옵니다.
const {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

// ⭐️ 라우트 정의 ⭐️

// POST /api/posts/:postId/comments - 새 댓글 생성 (인증 필요)
router.post('/posts/:postId/comments', authMiddleware, createComment);

// GET /api/posts/:postId/comments - 특정 게시글의 모든 댓글 조회
router.get('/posts/:postId/comments', getCommentsByPostId);

// PATCH /api/comments/:id - 댓글 수정 (인증 필요, 댓글 작성자만)
router.patch('/comments/:id', authMiddleware, updateComment);

// DELETE /api/comments/:id - 댓글 삭제 (인증 필요, 댓글 작성자 또는 게시글 작성자)
router.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = router;
