import React from 'react';
import { Link } from 'react-router-dom';
import './Intro.css'; 

export default function Intro() {
  return (
    <div className="intro-container">
      <header className="intro-header">
        <h2>🍚 밥풀 BapPool</h2>
        <nav>
          <Link to="/">홈</Link>
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </nav>
      </header>

      <section className="intro-content">
        <h1>밥풀 서비스 소개</h1>
        <p>
          밥풀은 기숙사생과 자취생들을 위한 배달비 절약 플랫폼입니다. 
          같은 지역에 있는 사람들과 함께 배달 음식을 주문해 배달비를 나누고, 
          커뮤니티를 통해 소통하며 맛있는 식사를 즐겨보세요!
        </p>
        <p>
          주요 기능:
          <ul>
            <li>같이 배달 주문으로 배달비 절약</li>
            <li>기숙사별 커뮤니티 게시판</li>
            <li>실시간 채팅으로 빠른 소통</li>
          </ul>
        </p>
        <Link to="/signup">
          <button className="intro-button">지금 시작하기</button>
        </Link>
      </section>
    </div>
  );
} 