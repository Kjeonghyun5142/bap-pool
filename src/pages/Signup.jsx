import React from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form>
          <label htmlFor="nickname">닉네임</label>
          <input type="text" id="nickname" name="nickname" required />

          <label htmlFor="email">이메일</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" name="password" required />

          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />

          <button type="submit">가입하기</button>
        </form>

        <div className="signup-links">
          <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </div>
    </div>
  );
}
