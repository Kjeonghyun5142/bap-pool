import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>
        <form>
          <label htmlFor="email">이메일</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" name="password" required />

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
