// bap-pool-backend/controllers/commentController.js

const db = require('../models'); // db 객체를 통해 Comment, User, Post 모델 접근

// 새 댓글 생성
const createComment = async (req, res) => {
  try {
    const postId = req.params.postId; // URL 파라미터에서 게시글 ID를 가져옴
    const userId = req.user.id;      // authMiddleware를 통해 JWT에서 추출된 사용자 ID
    const { content } = req.body;    // 요청 본문에서 댓글 내용 가져옴

    // 1. 필수 필드 유효성 검사
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    // 2. 게시글 존재 여부 확인
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '댓글을 작성할 게시글을 찾을 수 없습니다.' });
    }

    // 3. 댓글 생성
    const comment = await db.Comment.create({
      content: content.trim(),
      user_id: userId,
      post_id: postId,
    });

    // 댓글 생성 후, 댓글 작성자의 정보와 함께 반환 (프론트엔드에서 바로 표시하기 용이)
    const newCommentWithAuthor = await db.Comment.findByPk(comment.id, {
      include: [
        {
          model: db.User,
          as: 'CommentAuthor', // Comment 모델의 associate에서 설정된 alias
          attributes: ['id', 'nickname', 'dormitory'],
        },
      ],
    });

    res.status(201).json({ message: '댓글이 성공적으로 작성되었습니다.', comment: newCommentWithAuthor });
  } catch (error) {
    console.error('❌ 댓글 작성 실패:', error.stack);
    res.status(500).json({ message: '댓글 작성 실패', error: error.message });
  }
};

// 특정 게시글의 모든 댓글 조회
const getCommentsByPostId = async (req, res) => {
  try {
    const postId = req.params.postId;

    // 1. 게시글 존재 여부 확인 (선택 사항이지만 데이터 무결성을 위해 권장)
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '댓글을 조회할 게시글을 찾을 수 없습니다.' });
    }

    // 2. 해당 게시글의 댓글 목록 조회
    const comments = await db.Comment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: db.User,
          as: 'CommentAuthor', // Comment 모델의 associate에서 설정된 alias
          attributes: ['id', 'nickname', 'dormitory'], // 댓글 작성자 정보 포함
        },
      ],
      order: [['created_at', 'ASC']], // 오래된 댓글이 먼저 오도록 정렬
    });

    res.status(200).json({ message: '댓글 목록 조회 성공', comments });
  } catch (error) {
    console.error('❌ 댓글 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '댓글 목록 조회 실패', error: error.message });
  }
};

// 댓글 수정
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id; // URL 파라미터에서 댓글 ID를 가져옴
    const userId = req.user.id;      // authMiddleware를 통해 JWT에서 추출된 사용자 ID
    const { content } = req.body;    // 요청 본문에서 수정할 내용 가져옴

    // 1. 필수 필드 유효성 검사
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '수정할 댓글 내용을 입력해주세요.' });
    }

    // 2. 댓글 존재 여부 확인
    const comment = await db.Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 3. 댓글 작성자 본인인지 확인 (권한 확인)
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    // 4. 댓글 내용 업데이트
    await comment.update({ content: content.trim() });

    res.status(200).json({ message: '댓글이 성공적으로 수정되었습니다.', comment });
  } catch (error) {
    console.error('❌ 댓글 수정 실패:', error.stack);
    res.status(500).json({ message: '댓글 수정 실패', error: error.message });
  }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id; // URL 파라미터에서 댓글 ID를 가져옴
    const userId = req.user.id;      // authMiddleware를 통해 JWT에서 추출된 사용자 ID

    // 1. 댓글 존재 여부 확인
    const comment = await db.Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 2. 댓글 작성자 본인인지 또는 게시글 작성자인지 확인 (권한 확인)
    // 게시글 작성자도 댓글을 삭제할 수 있도록 허용 (선택 사항)
    const post = await db.Post.findByPk(comment.post_id);
    const isPostWriter = post && post.writer_id === userId;

    if (comment.user_id !== userId && !isPostWriter) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    // 3. 댓글 삭제
    await comment.destroy();

    res.status(200).json({ message: '댓글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('❌ 댓글 삭제 실패:', error.stack);
    res.status(500).json({ message: '댓글 삭제 실패', error: error.message });
  }
};

// 모든 댓글 컨트롤러 함수를 export
module.exports = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
