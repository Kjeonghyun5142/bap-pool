// src/pages/IndexPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './IndexPage.css'; 

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <header className="header">
        <h2>🍚 밥풀 BapPool</h2>
        <nav>
          <Link to="/intro">서비스 소개</Link>
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </nav>
      </header>

      <section className="hero">
        <h1>혼밥 그만! 같이 시켜요!</h1>
        <p>기숙사, 자취생들을 위한 배달비 아끼는 플랫폼</p>
        <button onClick={() => navigate('/signup')}>지금 시작하기</button>
      </section>
    </div>
  );
}
