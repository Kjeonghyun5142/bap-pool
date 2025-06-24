// Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import BackButton from '../components/BackButton';

export default function Signup() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dormitory, setDormitory] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nickname,
          dormitory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ 회원가입 성공:', data);
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } else {
        console.warn('❌ 회원가입 실패:', data.message);
        alert(data.message || '회원가입 실패');
      }
    } catch (err) {
      console.error('❗ 서버 오류:', err);
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form onSubmit={handleSignup}>
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <label htmlFor="dormitory">기숙사/자취 정보</label>
          <input
            type="text"
            id="dormitory"
            name="dormitory"
            required
            value={dormitory}
            onChange={(e) => setDormitory(e.target.value)}
          />

          <button type="submit">가입하기</button>
        </form>

        <div className="signup-links">
          <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
