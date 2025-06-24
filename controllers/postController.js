// bap-pool-backend/controllers/postController.js

const db = require('../models'); // db 객체를 불러옵니다.
const { Op } = require('sequelize'); // 필요한 경우 Op (Operator) 추가

// 게시글 등록
const createPost = async (req, res) => {
  try {
    // ⭐️ dormitory 대신 zone_id를 req.body에서 가져오도록 변경합니다. ⭐️
    const { title, content, min_price, deadline, zone_id } = req.body;
    const writerId = req.user.id; // authMiddleware를 통해 req.user에 설정된 사용자 ID

    // 필수 필드 유효성 검사 (zone_id도 필수로 체크)
    if (!title || !min_price || !deadline || !zone_id) {
      return res.status(400).json({ message: '필수 입력 필드 (제목, 최소 가격, 마감일, 지역)가 누락되었습니다.' });
    }

    // Zone ID의 유효성 검사 (선택 사항이지만 데이터 무결성을 위해 권장)
    const existingZone = await db.Zone.findByPk(zone_id);
    if (!existingZone) {
      return res.status(400).json({ message: '유효하지 않은 지역(Zone) ID입니다.' });
    }

    const post = await db.Post.create({
      title,
      content,
      min_price,
      deadline,
      zone_id, // ⭐️ Zone ID 사용 ⭐️
      writer_id: writerId,
      current_participants_count: 0 // 게시글 작성자는 참여자로 카운트하지 않으므로 초기값 0
    });

    res.status(201).json({ message: '게시글 등록 성공', post });

  } catch (error) {
    console.error('❌ 게시글 등록 실패:', error.stack); // 상세 오류 로그 추가
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
          model: db.Zone, // Zone 모델도 포함하여 지역 정보 가져오기
          as: 'Zone',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']] // 최신 글이 먼저 오도록 created_at 사용
    });

    res.status(200).json({ message: '게시글 목록 조회 성공', posts });
  } catch (error) {
    console.error('❌ 게시글 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '게시글 목록 조회 실패', error: error.message });
  }
};

// 게시글 상세 조회
// 게시글 상세 조회
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await db.Post.findByPk(postId, {
      include: [
        {
          model: db.User,
          as: 'Writer',                // Post.associate에 맞는 alias
          attributes: ['id', 'nickname', 'dormitory']
        },
        {
          model: db.Participant,
          as: 'Participants',          // Post.associate에 맞는 alias
          attributes: ['id', 'user_id', 'post_id'],
          include: {
            model: db.User,
            as: 'ParticipantUser',     // Participant.associate에 맞는 alias
            attributes: ['id', 'nickname', 'dormitory']
          }
        },
        {
          model: db.Zone,
          as: 'Zone',
          attributes: ['id', 'name', 'address']
        },
        // 여기서 댓글과 댓글 작성자를 추가합니다.
        {
          model: db.Comment,
          as: 'Comments',              // Post.js에서 alias로 설정한 이름과 일치해야 함
          attributes: ['id', 'content', 'created_at', 'user_id', 'post_id'],
          include: [{
            model: db.User,
            as: 'User',                // Comment.js에서 alias로 설정한 이름과 일치해야 함
            attributes: ['id', 'nickname', 'dormitory']
          }]
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
    const userId = req.user.id; // authMiddleware를 통해 설정된 사용자 ID

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 작성자만 마감할 수 있도록 권한 확인
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
    const userId = req.user.id; // authMiddleware를 통해 설정된 사용자 ID

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 작성자만 삭제할 수 있도록 권한 확인
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

// 게시글 수정 (기존 코드 유지)
const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id; // authMiddleware를 통해 설정된 사용자 ID
    // Zone ID도 수정 가능하도록 body에서 가져옵니다.
    const { title, content, min_price, deadline, max_participants, delivery_fee, dormitory, zone_id } = req.body;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 작성자만 수정할 수 있도록 권한 확인
    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
    }

    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글은 수정할 수 없습니다.' });
    }

    // 유효한 zone_id가 제공되었다면 Zone 존재 여부 검사
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
    // max_participants, delivery_fee, dormitory는 Post 모델에 없는 필드이므로 제거하거나 모델에 추가해야 합니다.
    // 현재 Post 모델에 없는 필드이므로, 제거하겠습니다.
    // if (max_participants !== undefined) updatedFields.max_participants = max_participants;
    // if (delivery_fee !== undefined) updatedFields.delivery_fee = delivery_fee;
    // if (dormitory !== undefined) updatedFields.dormitory = dormitory;
    if (zone_id !== undefined) updatedFields.zone_id = zone_id; // Zone ID 수정 가능하도록 추가

    await post.update(updatedFields);

    return res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.', post: post });

  } catch (error) {
    console.error('❌ 게시글 수정 실패:', error.stack);
    return res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.', error: error.message });
  }
};


// ⭐️⭐️⭐️ 게시글 참여 ⭐️⭐️⭐️ (기존 코드 유지)
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
      where: {
        post_id: postId,
        user_id: userId
      }
    });

    if (existingParticipant) {
      return res.status(409).json({ message: '이미 참여한 게시글입니다.' });
    }

    if (post.writer_id === userId) {
      return res.status(400).json({ message: '게시글 작성자는 참여할 수 없습니다.' });
    }

    const participant = await db.Participant.create({
      post_id: postId,
      user_id: userId
    });

    await post.increment('current_participants_count');

    res.status(201).json({ message: '게시글 참여 성공', participant });
  } catch (error) {
    console.error('❌ 게시글 참여 실패:', error.stack);
    res.status(500).json({ message: '게시글 참여 실패', error: error.message });
  }
};

// ⭐️⭐️⭐️ 게시글 참여 취소 (새로 추가) ⭐️⭐️⭐️
const leavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id; // 로그인한 사용자 ID

    // 1. 게시글 존재 여부 확인 (선택 사항이지만 좋은 습관)
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 2. 참여 정보 찾기
    const participant = await db.Participant.findOne({
      where: {
        post_id: postId,
        user_id: userId
      }
    });

    if (!participant) {
      return res.status(404).json({ message: '해당 게시글에 참여하고 있지 않습니다.' });
    }

    // 3. 참여 정보 삭제
    await participant.destroy();

    // 4. 게시글의 현재 참여자 수 감소 (0 이하로 내려가지 않도록 보호)
    if (post.current_participants_count > 0) {
      await post.decrement('current_participants_count');
    }

    res.status(200).json({ message: '게시글 참여가 성공적으로 취소되었습니다.' });
  } catch (error) {
    console.error('❌ 게시글 참여 취소 실패:', error.stack);
    res.status(500).json({ message: '게시글 참여 취소 실패', error: error.message });
  }
};

// ⭐️⭐️⭐️ 특정 게시글의 참여자 목록 조회 (새로 추가) ⭐️⭐️⭐️
const getParticipants = async (req, res) => {
  try {
    const postId = req.params.id;

    // 1. 게시글 존재 여부 확인 (선택 사항이지만 좋은 습관)
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 2. 해당 게시글의 참여자 목록 조회
    const participants = await db.Participant.findAll({
      where: { post_id: postId },
      include: {
        model: db.User, // Participant 모델에 User와의 관계가 설정되어 있어야 함
        as: 'ParticipantUser', // Participant 모델의 associate에서 정의된 as 값
        attributes: ['id', 'nickname', 'dormitory'] // 참여자 정보 중 필요한 필드만 가져옴
      },
      attributes: ['id', 'user_id', 'post_id', 'created_at'] // Participant 테이블 자체의 필드
    });

    if (participants.length === 0) {
      return res.status(200).json({ message: '아직 참여자가 없습니다.', participants: [] });
    }

    res.status(200).json({ message: '참여자 목록 조회 성공', participants });
  } catch (error) {
    console.error('❌ 참여자 목록 조회 실패:', error.stack);
    res.status(500).json({ message: '참여자 목록 조회 실패', error: error.message });
  }
};

// 모든 함수를 export 합니다.
module.exports = {
  createPost,
  getPosts,
  getPostById,
  closePost,
  deletePost,
  joinPost,
  updatePost,
  leavePost, // ⭐️ 새로 추가된 함수 export ⭐️
  getParticipants, // ⭐️ 새로 추가된 함수 export ⭐️
};
