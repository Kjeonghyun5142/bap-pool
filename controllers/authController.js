const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // DB에서 사용자 검증
  const user = await db.User.findOne({ where: { email } });
  if (!user || !(await user.validPassword(password))) {
    return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
  }

  // JWT 생성
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  // ⭐ 클라이언트에게 토큰을 쿠키로 전달
  res.cookie('token', token, {
    httpOnly: true,      // JS로 접근 불가 (보안 ↑)
    secure: false,       // 배포 시 true로 (https)
    sameSite: 'Lax',     // 또는 'None' + secure: true
    maxAge: 24 * 60 * 60 * 1000 // 1일
  });

  res.status(200).json({ message: '로그인 성공', user });
};
