import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css'; // mypage-css-enhanced가 이 파일에 있다고 가정합니다.
import BackButton from '../components/BackButton'; // 이 컴포넌트는 사용하지 않을 것입니다.

export default function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 사용자 정보 불러오기
    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserInfo(data.user);
        } else {
          console.error('❌ 사용자 정보를 불러올 수 없습니다:', data.message);
          // 필요한 경우 로그인 페이지로 리디렉션
          // navigate('/login');
        }
      })
      .catch(err => {
        console.error('❌ 내 정보 불러오기 실패:', err);
        // 네트워크 오류 등
      });

    // 내 게시글 불러오기
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

  if (!userInfo) {
    return (
      <div className="mypage-container">
        <h1 className="mypage-header">로딩 중...</h1> {/* 로딩 중에도 헤더 스타일 적용 */}
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <header className="mypage-header"> {/* CSS의 .mypage-header 적용 */}
        <h1>           <img
            src="/루피.jpg" // ⭐ 여기에 원하는 이미지 URL을 넣어주세요. ⭐
            alt="내 정보 아이콘"
            style={{ width: '32px', height: '32px', marginRight: '10px', verticalAlign: 'middle' }}
          />내 정보</h1> {/* h2 대신 h1을 사용하며 CSS의 .mypage-header h1 적용 */}
        <div className="mypage-button-group"> {/* CSS의 .mypage-button-group 적용 */}
          {/* '내 정보 수정' 버튼: button 스타일 적용 */}
          <button className="button" onClick={() => navigate('/mypage/edit')}>
            ✏️ 내 정보 수정
          </button>
          {/* '뒤로가기' 버튼: button 스타일 적용 */}
          <button className="button" onClick={() => navigate('/main')}>
             뒤로가기
          </button>
        </div>
      </header>

      {/* 내 정보 섹션: CSS의 .profile-section 적용 */}
      <section className="profile-section">
        <h2>상세 정보</h2> {/* CSS의 .profile-section h2 적용 */}
        <p><strong>닉네임:</strong> {userInfo.nickname}</p>
        <p><strong>거주지:</strong> {userInfo.dormitory}</p>
      </section>

      {/* 내가 쓴 글 섹션: CSS의 .post-section 적용 */}
      <section className="post-section">
        <h2>📝 내가 쓴 글</h2> {/* CSS의 .post-section h2 적용 */}
        {Array.isArray(myPosts) && myPosts.length === 0 ? (
          <p>작성한 글이 없습니다.</p>
        ) : Array.isArray(myPosts) ? (
          <div className="post-list"> {/* CSS의 .post-list 적용 */}
            {myPosts.map(post => (
              <div
                key={post.id}
                className="post-card" // ✅ post-item 대신 post-card 클래스 적용 (더 풍부한 스타일)
                onClick={() => navigate(`/post/${post.id}`)}
                style={{ cursor: 'pointer' }} // 클릭 가능 스타일 유지
              >
                <h3>{post.title}</h3> {/* CSS의 .post-card h3 적용 */}
                <p>{post.content}</p> {/* CSS의 .post-card p 적용 */}
                {/* post.Writer 및 post.Zone은 관계가 없을 경우를 대비해 ?. 사용 */}
                <p>작성자: {post.Writer?.nickname || '알 수 없음'} ({post.Zone?.name || '알 수 없음'})</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>게시글을 불러오는 중입니다...</p>
        )}
      </section>
    </div>
  );
}
