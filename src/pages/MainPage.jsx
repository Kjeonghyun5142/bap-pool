import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainPage.css'; // MainPage.css 파일이 존재한다고 가정

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [zones, setZones] = useState([]); // 밥풀존 목록 상태
  const [selectedZoneId, setSelectedZoneId] = useState(''); // 선택된 밥풀존 ID 상태
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

  // ⭐️ 밥풀존 목록 불러오기 및 디버깅 ⭐️
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/zones`, {
          credentials: 'include', // 인증 정보 (쿠키 등) 포함
        });
        const data = await res.json();
        if (res.ok) {
          const fetchedZones = data.zones || data; // 백엔드 응답 구조에 따라 data.zones 또는 data
          setZones(fetchedZones);
          console.log('✅ 불러온 밥풀존 데이터:', fetchedZones); // ⭐️ 콘솔에 불러온 데이터 출력 ⭐️
        } else {
          console.warn('❌ 밥풀존 목록 불러오기 실패:', data.message);
        }
      } catch (err) {
        console.error('❌ 밥풀존 목록 요청 실패:', err);
      }
    };
    fetchZones();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

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

  // 🔍 제목 및 밥풀존으로 필터링된 게시글
  const filteredPosts = posts.filter(post => {
    const matchesSearchTerm = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZoneId === '' || post.zone_id.toString() === selectedZoneId; // selectedZoneId가 비어있으면 모든 지역, 아니면 일치하는 지역만

    return matchesSearchTerm && matchesZone;
  });

  return (
    <div className="mainpage-container">
      <header className="mainpage-header">
        <div className="logo">🍚 밥풀</div>
        <div className="user-actions">
          {user ? (
            <>
              <span className="user-info">{user.nickname}({user.dormitory}) 님</span>
              <Link to="/mypage" className="mypage-link">마이페이지</Link>
              <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </>
          ) : (
            <span>로그인 정보를 불러오는 중...</span>
          )}
        </div>
      </header>

      <main className="mainpage-main">
        <div className="top-bar">
          {/* ✅ 검색창 */}
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {/* ⭐️ 밥풀존 필터링 드롭다운 ⭐️ */}
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="zone-filter-select" // MainPage.css에 스타일 추가 필요 (이전 답변 참고)
          >
            <option value="">모든 지역</option> {/* 모든 지역 보기 옵션 */}
            {zones.map(zone => ( // ⭐️ zones 상태의 데이터를 옵션으로 렌더링 ⭐️
              <option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>
            ))}
          </select>

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
              return (
                <Link to={`/post/${post.id}`} key={post.id} className="post-card-link">
                  <div className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <p>작성자: {post.Writer?.nickname} ({post.Zone?.name})</p>
                    <p className="post-date">
                      작성일: {post.created_at
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
