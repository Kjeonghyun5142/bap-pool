import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainPage.css'; // MainPage.css 파일이 존재한다고 가정

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ 검색어 상태 추가
  const navigate = useNavigate();

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include', // 인증 정보 (쿠키 등) 포함
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          console.warn('❌ 사용자 정보 불러오기 실패:', data.message);
          // 사용자 정보가 없더라도 페이지는 표시
        }
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
          setPosts(data.posts); // data.posts에 게시글 배열이 들어있다고 가정
        } else {
          console.warn('❌ 글 목록 불러오기 실패:', data.message);
        }
      } catch (err) {
        console.error('❌ 글 목록 요청 실패:', err);
      }
    };
    fetchPosts();
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // 인증 정보 (세션 쿠키) 포함하여 요청
      });

      if (res.ok) {
        setUser(null); // 사용자 정보 초기화
        alert('로그아웃 되었습니다.');
        navigate('/'); // 로그인 페이지로 리디렉션
      } else {
        const errorData = await res.json();
        console.error('❌ 로그아웃 실패:', errorData.message);
        alert(`로그아웃 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('❌ 로그아웃 요청 실패:', err);
      alert('로그아웃 중 네트워크 오류가 발생했습니다.');
    }
  };

  // 🔍 제목으로 필터링된 게시글 (검색어에 따라 게시글 목록 필터링)
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mainpage-container">
      <header className="mainpage-header">
        <div className="logo">🍚 밥풀</div>
        <div className="user-actions"> {/* user-info 대신 user-actions로 통합 */}
          {user ? (
            <>
              <span className="user-info">{user.nickname}({user.dormitory}) 님</span>
              <Link to="/mypage" className="mypage-link">마이페이지</Link>
              <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </>
          ) : (
            // 로딩 상태 또는 로그인 필요 메시지
            <span>로그인 정보를 불러오는 중...</span>
          )}
        </div>
      </header>

      <main className="mainpage-main">
        <div className="top-bar">
          {/* ✅ 검색창 추가 */}
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <Link to="/write">
            <button className="write-btn">글 쓰기</button>
          </Link>
        </div>

        <div className="post-list">
          {filteredPosts.length === 0 ? (
            <div className="empty-state main-empty-fade-in">
              <h2>📭 아직 게시된 글이 없어요!</h2>
              <p>같이 먹을 사람을 찾고 있다면, 첫 번째로 글을 올려보세요 😊</p>
              <Link to="/write">
                <button className="write-btn">지금 글 작성하기</button>
              </Link>
            </div>

          ) : (
            filteredPosts.map(post => {
              // console.log('🕒 createdAt:', post.createdAt); // 디버깅용 로그 (필요없으면 삭제)
              // post.created_at을 사용하는 이유는 백엔드 모델의 underscored: true 설정 때문입니다.

              return (
                <Link to={`/post/${post.id}`} key={post.id} className="post-card-link">
                  <div className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <p>작성자: {post.Writer?.nickname} ({post.Zone?.name})</p>
                    <p style={{ color: 'gray', fontSize: '0.85rem', marginTop: '4px' }}>
                      작성일: {post.created_at // post.created_at이 있는지 먼저 확인
                                ? new Date(post.created_at).toLocaleDateString()
                                : '날짜 정보 없음'}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
