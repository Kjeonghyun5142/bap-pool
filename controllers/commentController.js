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

  const comment = await Comment.create({
    content,
    post_id: post.id,
    user_id: userId,
  });


    res.status(201).json({ message: '댓글이 추가되었습니다.', comment });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    res.status(500).json({ message: '댓글 추가 실패' });
  }
};

// 특정 게시글의 댓글 조회
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: Comment,
          as: 'Comments', // ✅ 반드시 alias 사용
          include: [
            {
              model: User,
              as: 'User',   // ✅ Comment 모델에서 지정한 alias
              attributes: ['id', 'nickname'], // 원하면 필요한 항목만 지정
            },
          ],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json(post.Comments);
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

    if (comment.userId !== userId) {
      return res.status(403).json({ message: '댓글 작성자만 수정할 수 있습니다.' });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ message: '댓글이 수정되었습니다.', comment });
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
    if (post.writer_id !== userId) {
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
