import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setUser(data.user);
        else console.warn('❌ 사용자 정보 실패:', data.message);
      } catch (err) {
        console.error('❌ 사용자 정보 요청 실패:', err);
      }
    };
    fetchUser();
  }, []);

  // 게시글 목록 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
        } else {
          console.warn('❌ 글 목록 실패:', data.message);
        }
      } catch (err) {
        console.error('❌ 글 목록 요청 실패:', err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="mainpage-container">
      <header className="mainpage-header">
        <div className="logo">🍚 밥풀</div>
        <div className="user-info">
          {user ? (
            <>
              <span>{user.nickname}({user.dormitory}) 님</span>
              <Link to="/mypage" className="mypage-link">마이페이지</Link>
            </>
          ) : (
            <span>로그인 정보를 불러오는 중...</span>
          )}
        </div>
      </header>

      <main className="mainpage-main">
        <div className="top-bar">
          <Link to="/write">
            <button className="write-btn">글 쓰기</button>
          </Link>
        </div>

        <div className="post-list">
          {posts.length === 0 ? (
            <p>현재 등록된 글이 없습니다.</p>
          ) : (
            posts.map(post => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card-link">
                <div className="post-card">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <p>작성자: {post.Writer.nickname} ({post.Zone?.name})</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
