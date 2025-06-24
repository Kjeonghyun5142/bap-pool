// bap-pool-backend/controllers/postController.js

const db = require('../models');
const { Op } = require('sequelize');

// 게시글 등록
const createPost = async (req, res) => {
  try {
    const { title, content, min_price, deadline, zone_id } = req.body;
    const writerId = req.user.id;

    if (!title || !min_price || !deadline || !zone_id) {
      return res.status(400).json({ message: '필수 입력 필드 (제목, 최소 가격, 마감일, 지역)가 누락되었습니다.' });
    }

    const existingZone = await db.Zone.findByPk(zone_id);
    if (!existingZone) {
      return res.status(400).json({ message: '유효하지 않은 지역(Zone) ID입니다.' });
    }

    const post = await db.Post.create({
      title,
      content,
      min_price,
      deadline,
      zone_id,
      writer_id: writerId,
      current_participants_count: 0
    });

    res.status(201).json({ message: '게시글 등록 성공', post });
  } catch (error) {
    console.error('❌ 게시글 등록 실패:', error.stack);
    res.status(500).json({ message: '게시글 등록 실패', error: error.message });
  }
};

// 게시글 목록 조회
const getPosts = async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      include: [
        {
          model: db.User,
          as: 'Writer',
          attributes: ['id', 'nickname', 'dormitory'],
        },
        {
          model: db.Zone,
          as: 'Zone',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ message: '게시글 목록 조회 성공', posts });
  } catch (error) {
    console.error('❌ 게시글 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '게시글 목록 조회 실패', error: error.message });
  }
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await db.Post.findByPk(postId, {
      include: [
        {
          model: db.User,
          as: 'Writer',
          attributes: ['id', 'nickname', 'dormitory']
        },
        {
          model: db.Participant,
          as: 'Participants',
          attributes: ['id', 'user_id', 'post_id'],
          include: {
            model: db.User,
            as: 'ParticipantUser',
            attributes: ['id', 'nickname', 'dormitory']
          }
        },
        {
          model: db.Zone,
          as: 'Zone',
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '게시글 상세 조회 성공', post });
  } catch (error) {
    console.error('❌ 게시글 상세 조회 실패:', error.stack);
    res.status(500).json({ message: '게시글 상세 조회 실패', error: error.message });
  }
};

// 게시글 마감
const closePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 마감할 권한이 없습니다.' });
    }

    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글입니다.' });
    }

    await post.update({ is_closed: true });

    res.status(200).json({ message: '게시글 마감 처리 성공', post });
  } catch (error) {
    console.error('❌ 게시글 마감 처리 실패:', error.stack);
    res.status(500).json({ message: '게시글 마감 처리 실패', error: error.message });
  }
};

// 게시글 삭제
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
    }

    await post.destroy();

    res.status(200).json({ message: '게시글 삭제 성공' });
  } catch (error) {
    console.error('❌ 게시글 삭제 실패:', error.stack);
    res.status(500).json({ message: '게시글 삭제 실패', error: error.message });
  }
};

// 게시글 수정
const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { title, content, min_price, deadline, zone_id } = req.body;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
    }

    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글은 수정할 수 없습니다.' });
    }

    if (zone_id !== undefined && zone_id !== null) {
      const existingZone = await db.Zone.findByPk(zone_id);
      if (!existingZone) {
        return res.status(400).json({ message: '유효하지 않은 지역(Zone) ID입니다.' });
      }
    }

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (content !== undefined) updatedFields.content = content;
    if (min_price !== undefined) updatedFields.min_price = min_price;
    if (deadline !== undefined) updatedFields.deadline = deadline;
    if (zone_id !== undefined) updatedFields.zone_id = zone_id;

    await post.update(updatedFields);

    return res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.', post });
  } catch (error) {
    console.error('❌ 게시글 수정 실패:', error.stack);
    return res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.', error: error.message });
  }
};

// 게시글 참여
const joinPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글입니다.' });
    }

    const existingParticipant = await db.Participant.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (existingParticipant) {
      return res.status(409).json({ message: '이미 참여한 게시글입니다.' });
    }

    if (post.writer_id === userId) {
      return res.status(400).json({ message: '게시글 작성자는 참여할 수 없습니다.' });
    }

    const participant = await db.Participant.create({ post_id: postId, user_id: userId });
    await post.increment('current_participants_count');

    res.status(201).json({ message: '게시글 참여 성공', participant });
  } catch (error) {
    console.error('❌ 게시글 참여 실패:', error.stack);
    res.status(500).json({ message: '게시글 참여 실패', error: error.message });
  }
};

// 게시글 참여 취소
const leavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const participant = await db.Participant.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (!participant) {
      return res.status(404).json({ message: '해당 게시글에 참여하고 있지 않습니다.' });
    }

    await participant.destroy();
    if (post.current_participants_count > 0) {
      await post.decrement('current_participants_count');
    }

    res.status(200).json({ message: '게시글 참여가 성공적으로 취소되었습니다.' });
  } catch (error) {
    console.error('❌ 게시글 참여 취소 실패:', error.stack);
    res.status(500).json({ message: '게시글 참여 취소 실패', error: error.message });
  }
};

// 게시글 참여자 목록 조회
const getParticipants = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const participants = await db.Participant.findAll({
      where: { post_id: postId },
      include: {
        model: db.User,
        as: 'ParticipantUser',
        attributes: ['id', 'nickname', 'dormitory']
      },
      attributes: ['id', 'user_id', 'post_id', 'created_at']
    });

    res.status(200).json({ message: '참여자 목록 조회 성공', participants });
  } catch (error) {
    console.error('❌ 참여자 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '참여자 목록 조회 실패', error: error.message });
  }
};

// 내가 쓴 글 목록 조회
const getMyPosts = async (req, res) => {
  try {
    console.log('✅ req.user.id:', req.user?.id);

    const posts = await db.Post.findAll({
      where: { writer_id: req.user.id },
      include: [
        {
          model: db.Zone,
          as: 'Zone',
          attributes: ['id', 'name']
        },
        {
          model: db.User,
          as: 'Writer',
          attributes: ['nickname']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Sequelize 객체를 순수 JSON으로 변환 (프론트에서 제대로 보이도록)
    const plainPosts = posts.map((post) => post.toJSON());

    res.status(200).json({ posts: plainPosts });
  } catch (error) {
    console.error('❌ 내 글 목록 조회 실패:', error);
    res.status(500).json({ message: '내 글 목록을 불러오는 중 오류 발생' });
  }
};



module.exports = {
  createPost,
  getPosts,
  getPostById,
  closePost,
  deletePost,
  joinPost,
  updatePost,
  leavePost,
  getParticipants,
  getMyPosts
};
