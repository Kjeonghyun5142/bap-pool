import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import BackButton from '../components/BackButton';

export default function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUserInfo(data.user);
      })
      .catch(err => {
        console.error('❌ 내 정보 불러오기 실패:', err);
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/users/me/posts`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setMyPosts(data.posts || []);
      })
      .catch(err => {
        console.error('❌ 내 게시글 불러오기 실패:', err);
      });
  }, []);

  if (!userInfo) return <div>로딩 중...</div>;

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2>👤 내 정보</h2>
        <div className="mypage-button-group">
          <button className="edit-button" onClick={() => navigate('/mypage/edit')}>
            ✏️ 내 정보 수정
          </button>
           <button className="back-button" onClick={() => navigate('/main')}>
            🔙 뒤로가기
          </button>
        </div>
      </div>

      <p><strong>닉네임:</strong> {userInfo.nickname}</p>
      <p><strong>거주지:</strong> {userInfo.dormitory}</p>

      <h2>📝 내가 쓴 글</h2>
      {Array.isArray(myPosts) && myPosts.length === 0 ? (
        <p>작성한 글이 없습니다.</p>
      ) : Array.isArray(myPosts) ? (
        <ul>
          {myPosts.map(post => (
            <li
              key={post.id}
              className="post-item"
              onClick={() => navigate(`/post/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <strong>{post.title}</strong><br />
              <span>{post.content}</span><br />
              <small>{new Date(post.created_at).toLocaleString()}</small><br />
              <em>{post.Zone?.name}</em> by {post.Writer?.nickname}
            </li>
          ))}
        </ul>
      ) : (
        <p>게시글을 불러오는 중입니다...</p>
      )}
    </div>
  );
}
