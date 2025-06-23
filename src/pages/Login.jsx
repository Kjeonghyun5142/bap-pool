import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // JWT 쿠키 등 포함하려면 이거 필요
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ 로그인 성공:', data);
        console.log('👉 페이지 이동 시도');
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/main');
      } else {
        console.warn('❌ 로그인 실패:', data.message);
        alert(data.message || '로그인 실패');
      }
    } catch (err) {
      console.error('❗ 서버 오류:', err);
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="login-container">
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

          <button type="submit">로그인</button>
        </form>

        <div className="login-links">
          <Link to="/signup">회원가입</Link>
          <span>|</span>
          <Link to="/forgot">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}
