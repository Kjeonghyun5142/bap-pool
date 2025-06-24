// bap-pool-backend/controllers/commentController.js

const { Comment, User, Post } = require('../models');

// 댓글 생성
exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const newCommentInstance = await Comment.create({
      content,
      post_id: post.id,
      user_id: userId,
    });

    // ⭐️⭐️⭐️ 새로 생성된 댓글을 다시 조회하여 User 정보와 created_at을 명시적으로 포함 ⭐️⭐️⭐️
    // 이렇게 하면 toJSON()이 동작하기 전에도 필요한 필드를 확실히 가져올 수 있습니다.
    const fullComment = await Comment.findByPk(newCommentInstance.id, {
      include: [
        {
          model: User,
          as: 'User', // Comment 모델에서 User와의 관계를 'User'로 설정했는지 확인
          attributes: ['id', 'nickname', 'dormitory'], // User에서 필요한 속성만 가져옴
        },
      ],
      // ⭐️ Comment 모델의 기본 필드를 명시적으로 지정하여 created_at이 누락되지 않도록 합니다.
      // underscored: true 설정에 따라 created_at으로 자동 매핑될 것입니다.
      attributes: [
        'id', 'content', 'post_id', 'user_id',
        'createdAt', // Sequelize 인스턴스에서 사용하는 카멜케이스 속성 이름
        'updatedAt'  // 필요하다면 updatedAt도 포함
      ]
    });

    // ⭐️⭐️⭐️ fullComment.toJSON()을 사용하여 순수 JSON 객체로 변환하여 반환 ⭐️⭐️⭐️
    // 이 단계에서 underscored: true 설정에 따라 'createdAt'이 'created_at'으로 변환됩니다.
    res.status(201).json({ message: '댓글이 추가되었습니다.', comment: fullComment.toJSON() });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    res.status(500).json({ message: '댓글 추가 실패' });
  }
};

// 특정 게시글의 댓글 조회
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          as: 'User', // Comment 모델에서 지정한 alias
          attributes: ['id', 'nickname', 'dormitory'], // dormitory 추가 (프론트엔드에서 사용 가능성)
        },
      ],
      order: [['created_at', 'ASC']] // 오래된 댓글부터 정렬
    });

    // 프론트엔드에 배열 형태로 바로 전달
    res.status(200).json(comments);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({ message: '댓글 조회 실패' });
  }
};


// 댓글 수정
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: '댓글 작성자만 수정할 수 있습니다.' });
    }

    comment.content = content;
    await comment.save();

    // 수정된 댓글을 다시 조회하여 User 정보를 포함
    const updatedComment = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'User', attributes: ['id', 'nickname', 'dormitory'] }],
        // attributes: ['id', 'content', 'post_id', 'user_id', 'createdAt', 'updatedAt'] // 필요한 경우 명시적 추가
    });

    res.status(200).json({ message: '댓글이 수정되었습니다.', comment: updatedComment.toJSON() });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    res.status(500).json({ message: '댓글 수정 실패' });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 댓글 작성자 또는 게시글 작성자만 삭제할 수 있도록 조건 추가
    if (comment.user_id !== userId) {
      const post = await Post.findByPk(comment.post_id);
      if (!post || post.writer_id !== userId) {
        return res.status(403).json({ message: '댓글 작성자 또는 게시글 작성자만 삭제할 수 있습니다.' });
      }
    }

    await comment.destroy();
    res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
};
