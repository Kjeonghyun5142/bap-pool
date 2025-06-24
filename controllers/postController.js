// bap-pool-backend/controllers/postController.js

const db = require('../models');
const { Op } = require('sequelize'); // Op (Operator)는 필요할 경우 사용

// 게시글 등록
const createPost = async (req, res) => {
  try {
    const { title, content, min_price, deadline, zone_id } = req.body;
    const writerId = req.user.id; // authMiddleware를 통해 req.user에 사용자 정보가 있다고 가정

    // 필수 입력 필드 유효성 검사
    if (!title || !min_price || !deadline || !zone_id) {
      return res.status(400).json({ message: '필수 입력 필드 (제목, 최소 가격, 마감일, 지역)가 누락되었습니다.' });
    }

    // Zone ID 유효성 검사
    const existingZone = await db.Zone.findByPk(zone_id);
    if (!existingZone) {
      return res.status(400).json({ message: '유효하지 않은 지역(Zone) ID입니다.' });
    }

    // 게시글 생성
    const post = await db.Post.create({
      title,
      content,
      min_price,
      deadline,
      zone_id,
      writer_id: writerId,
      current_participants_count: 0 // 초기 참여자 수는 0으로 설정
    });

    res.status(201).json({ message: '게시글 등록 성공', post });
  } catch (error) {
    console.error('❌ 게시글 등록 실패:', error.stack); // 상세 에러 스택 출력
    res.status(500).json({ message: '게시글 등록 실패', error: error.message });
  }
};

// 게시글 목록 조회
const getPosts = async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      // attributes 배열을 완전히 제거했습니다.
      // Sequelize는 timestamps: true 설정에 따라 createdAt과 updatedAt을 자동으로 포함합니다.
      include: [
        {
          model: db.User, // 작성자(User) 모델 포함
          as: 'Writer', // Post 모델과의 연관 관계에서 사용된 alias
          attributes: ['id', 'nickname', 'dormitory'], // User 모델에서 가져올 속성
        },
        {
          model: db.Zone, // 지역(Zone) 모델 포함
          as: 'Zone', // Post 모델과의 연관 관계에서 사용된 alias
          attributes: ['id', 'name'] // Zone 모델에서 가져올 속성
        }
      ],
      order: [['created_at', 'DESC']] // 최신 게시글부터 정렬 (DB 컬럼명 사용)
    });

    res.status(200).json({ message: '게시글 목록 조회 성공', posts });
  } catch (error) {
    console.error('❌ 게시글 목록 조회 실패:', error.stack); // 상세 에러 스택 출력
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
        },
        {
          model: db.Comment,
          as: 'Comments',
          attributes: ['id', 'content', 'created_at', 'user_id', 'post_id'],
          include: [{
            model: db.User,
            as: 'User',
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
    const userId = req.user.id;

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 게시글 작성자만 마감 가능
    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 마감할 권한이 없습니다.' });
    }

    // 이미 마감된 게시글인지 확인
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

    // 게시글 작성자만 삭제 가능
    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
    }

    await post.destroy(); // 게시글 삭제

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

    console.log('수정 요청 데이터:', req.body); // 디버깅 로그 추가

    // 입력 데이터 검증
    if (!title || !min_price || !deadline || !zone_id) {
      return res.status(400).json({ message: '필수 입력 필드 (제목, 최소 가격, 마감일, 지역)가 누락되었습니다.' });
    }
    if (isNaN(parseInt(min_price))) {
      return res.status(400).json({ message: '최소 가격은 숫자 형식이어야 합니다.' });
    }
    if (isNaN(parseInt(zone_id))) {
      return res.status(400).json({ message: '지역 ID는 숫자 형식이어야 합니다.' });
    }
    // Date.parse는 유효하지 않은 날짜에 대해 NaN을 반환합니다.
    if (isNaN(Date.parse(deadline))) {
      return res.status(400).json({ message: '마감일은 유효한 날짜 형식이어야 합니다.' });
    }

    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 게시글 작성자만 수정 가능
    if (post.writer_id !== userId) {
      return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
    }

    // 마감된 게시글은 수정 불가
    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글은 수정할 수 없습니다.' });
    }

    // Zone ID 유효성 검사
    const existingZone = await db.Zone.findByPk(parseInt(zone_id));
    if (!existingZone) {
      return res.status(400).json({ message: '유효하지 않은 지역(Zone) ID입니다.' });
    }

    // 업데이트할 필드 객체 생성
    const updatedFields = {
      title,
      content: content || null, // 내용이 비어있으면 null로 처리
      min_price: parseInt(min_price), // 숫자로 변환
      deadline: new Date(deadline), // Date 객체로 변환
      zone_id: parseInt(zone_id), // 숫자로 변환
    };

    await post.update(updatedFields); // 게시글 업데이트

    // 업데이트된 게시글을 다시 조회하여 반환 (관계 정보 포함)
    const updatedPost = await db.Post.findByPk(postId, {
      include: [
        { model: db.User, as: 'Writer', attributes: ['id', 'nickname', 'dormitory'] },
        { model: db.Zone, as: 'Zone', attributes: ['id', 'name', 'address'] }
      ]
    });

    return res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.', post: updatedPost });
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

    // 마감된 게시글은 참여 불가
    if (post.is_closed) {
      return res.status(400).json({ message: '이미 마감된 게시글입니다.' });
    }

    // 이미 참여한 게시글인지 확인
    const existingParticipant = await db.Participant.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (existingParticipant) {
      return res.status(409).json({ message: '이미 참여한 게시글입니다.' });
    }

    // 게시글 작성자는 참여 불가
    if (post.writer_id === userId) {
      return res.status(400).json({ message: '게시글 작성자는 참여할 수 없습니다.' });
    }

    // 참여자 생성 및 참여자 수 증가
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

    // 참여자 확인
    const participant = await db.Participant.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (!participant) {
      return res.status(404).json({ message: '해당 게시글에 참여하고 있지 않습니다.' });
    }

    await participant.destroy(); // 참여 취소
    if (post.current_participants_count > 0) {
      await post.decrement('current_participants_count'); // 참여자 수 감소
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
      attributes: ['id', 'user_id', 'post_id', 'created_at'] // 참여자 정보에 created_at 포함
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
      attributes: [ // 내가 쓴 글에도 createdAt 추가
        'id',
        'title',
        'content',
        'min_price',
        'deadline',
        'is_closed',
        'current_participants_count',
        'writer_id', // 여기는 본인의 글이므로 writer_id 필요할 수 있음
        'zone_id',
        'createdAt',
        'updatedAt'
      ],
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
