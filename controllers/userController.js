const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

// 로그인 처리
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    return res.status(200).json({
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        dormitory: user.dormitory
      }
    });
  } catch (error) {
    console.error('❌ 로그인 오류:', error.stack);
    return res.status(500).json({ message: '로그인 실패: 서버 오류', error: error.message });
  }
};

// ✅ 회원가입 처리
const createUser = async (req, res) => {
  try {
    const { email, password, nickname, dormitory } = req.body;

    if (!email || !password || !nickname || !dormitory) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 이메일 중복 검사
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: '이미 등록된 이메일입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await db.User.create({
      email,
      password: hashedPassword,
      nickname,
      dormitory,
    });

    return res.status(201).json({ message: '회원가입 성공', user: newUser });
  } catch (error) {
    console.error('❌ 회원가입 오류:', error.stack);
    return res.status(500).json({ message: '회원가입 실패', error: error.message });
  }
};

// ✅ 모든 사용자 조회 (관리자/개발용)
const getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'email', 'nickname', 'dormitory'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('❌ getUsers 오류:', error.stack);
    res.status(500).json({ message: '사용자 목록 조회 실패' });
  }
};

// ✅ 현재 로그인된 사용자 정보 조회
const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: '인증되지 않았습니다.' });

    res.status(200).json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      dormitory: user.dormitory,
    });
  } catch (error) {
    console.error('❌ getMe 오류:', error.stack);
    res.status(500).json({ message: '내 정보 조회 실패' });
  }
};

// ✅ 현재 로그인된 사용자 정보 수정
const updateMe = async (req, res) => {
  try {
    const user = req.user;
    const { nickname, dormitory } = req.body;

    user.nickname = nickname || user.nickname;
    user.dormitory = dormitory || user.dormitory;
    await user.save();

    res.status(200).json({ message: '정보 수정 완료', user });
  } catch (error) {
    console.error('❌ updateMe 오류:', error.stack);
    res.status(500).json({ message: '정보 수정 실패' });
  }
};

// ✅ 최종 export
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getMe,
  updateMe,
};
