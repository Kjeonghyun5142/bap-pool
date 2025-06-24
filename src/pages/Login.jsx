import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import BackButton from '../components/BackButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ 로그인 성공:', data);
        navigate('/main');
      } else {
        alert(data.message || '로그인 실패');
      }
    } catch (err) {
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="login-container">
      <div className="hero-section">
        <span className="hero-icon">🍚</span>
        <h1>밥풀에 오신 걸 환영해요!</h1>
        <p>로그인하고 친구들과 함께 배달비를 절약하세요!</p>
      </div>

      <div className="login-box">
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="이메일 입력"
          />

          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="비밀번호 입력"
          />

          <button type="submit" aria-label="로그인 버튼">
            로그인
          </button>

        </form>

        <div className="login-links">
          <Link to="/signup">회원가입</Link>
          <span>|</span>
          <Link to="/forgot">비밀번호 찾기</Link>
        </div>

        {/* ✅ 뒤로가기 버튼 추가 */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
