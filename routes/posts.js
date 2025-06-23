// routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createPost,
  getPosts,       // <-- 추가 (에러 발생 원인으로 추정)
  getPostById,    // <-- 추가 (에러 발생 원인으로 추정)
  closePost,      // <-- 추가
  deletePost,
  joinPost,
  leavePost,     // ⭐️ 이 줄 추가 ⭐️
  getParticipants, // ⭐️ 이 줄 추가 ⭐️    
} = require('../controllers/postController'); // 구조 분해 할당으로 함수들을 명시적으로 가져옴

// POST /posts - 게시글 등록 (인증 필요)
router.post('/', authMiddleware, createPost);

// GET /posts - 게시글 목록 조회
router.get('/', getPosts); // <-- getPosts 함수가 유효한지 확인

// GET /posts/:id - 게시글 상세 조회
router.get('/:id', getPostById); // <-- getPostById 함수가 유효한지 확인

// PATCH /posts/:id/close - 게시글 마감 (인증 필요, 작성자만)
router.patch('/:id/close', authMiddleware, closePost);

// DELETE /posts/:id - 게시글 삭제 (인증 필요, 작성자만)
router.delete('/:id', authMiddleware, deletePost);

// POST /posts/:id/join - 게시글 참여 (인증 필요) 
router.post('/:id/join', authMiddleware, joinPost);

// routes/posts.js (임시 수정)
router.post('/', /* authMiddleware, */ async (req, res) => { // ⭐️ authMiddleware 제거 또는 주석 처리
    // ... 게시글 생성 로직
});

// DELETE /api/posts/:id/join - 게시글 참여 취소 (인증 필요)
router.delete('/:id/join', authMiddleware, leavePost); // ⭐️ 이 라우트 추가 ⭐️


// GET /api/posts/:id/participants - 특정 게시글의 참여자 목록 조회
router.get('/:id/participants', getParticipants); // ⭐️ 이 라우트 추가 ⭐️

// 인증된 사용자만 가능하며, 해당 게시글의 작성자만 수정 가능
router.patch('/:id', authMiddleware, postController.updatePost);
module.exports = router;