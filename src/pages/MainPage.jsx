import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

export default function MainPage() {
  const posts = [
    { id: 1, title: '마라탕 같이 시켜요!', content: 'P동 기숙사 / 저녁 6시 예정' },
    { id: 2, title: '치킨 드실 분~', content: '치킨은 역시 반반!' },
    { id: 3, title: '버거킹 배달 나눌 분 구해요', content: '근처 2명 더 필요해요!' },
  ];

  return (
    <div className="mainpage-container">
      <header className="mainpage-header">
        <div className="logo">🍚 밥풀</div>
        <div className="user-info">
          <span>홍길동(진하개) 님</span>
          <Link to="/mypage" className="mypage-link">마이페이지</Link>
        </div>
      </header>

      <main className="mainpage-main">
        <div className="top-bar">
          <Link to="/write">
            <button className="write-btn">글 쓰기</button>
          </Link>
        </div>

        <div className="post-list">
          {posts.map(post => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              className="post-card-link"
            >
              <div className="post-card">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
