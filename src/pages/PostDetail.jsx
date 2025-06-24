// bap-pool-frontend/src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 게시글, 댓글, 사용자, 수정 폼, 지역 목록, 로딩 상태를 위한 상태 변수들
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null); // 현재 로그인한 사용자 정보
  const [isEditing, setIsEditing] = useState(false); // 게시글 수정 모드 여부
  const [editForm, setEditForm] = useState({ // 게시글 수정 폼 데이터
    title: '',
    content: '',
    min_price: '',
    deadline: '',
    zone_id: '',
  });
  const [zones, setZones] = useState([]); // 지역 목록
  const [isLoading, setIsLoading] = useState(false); // API 요청 로딩 상태
  const [showCommentsSection, setShowCommentsSection] = useState(false); // 댓글 섹션 표시 여부

  // 데이터를 불러오는 useEffect (사용자 정보, 게시글, 댓글, 지역 목록)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // 데이터 로딩 시작
      try {
        // 1. 사용자 정보 불러오기
        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include', // 인증 정보를 포함하여 요청
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData.user);
        } else {
          console.warn('❌ 사용자 정보 불러오기 실패:', userData.message);
          // 사용자 정보가 없어도 게시글은 볼 수 있게, 에러 처리는 경고로만
        }

        // 2. 게시글 상세 데이터 불러오기
        const postResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          credentials: 'include',
        });
        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          console.error('❌ 게시글 응답 오류:', postResponse.status, errorText);
          throw new Error(`게시글 불러오기 실패: ${postResponse.status}`);
        }
        const postData = await postResponse.json();
        setPost(postData.post); // 'post' 필드에 실제 게시글 데이터가 있음
        setComments(postData.post.Comments || []); // 게시글 데이터 안에 댓글이 포함되어 있다고 가정

        // 수정 폼 초기값 설정 (게시글 데이터를 기반으로)
        setEditForm({
          title: postData.post.title,
          content: postData.post.content || '',
          min_price: postData.post.min_price.toString(),
          // deadline은 ISO 문자열을 datetime-local 형식에 맞게 자르기
          deadline: new Date(postData.post.deadline).toISOString().slice(0, 16),
          zone_id: postData.post.zone_id.toString(),
        });

      } catch (error) {
        console.error('❌ 데이터 불러오기 실패:', error);
        alert('데이터를 불러오는 데 실패했습니다.'); // 사용자에게 알림
      } finally {
        setIsLoading(false); // 데이터 로딩 완료
      }
    };

    // 3. 지역 목록 불러오기 (fetchData와 분리하여 처리)
    const fetchZones = async () => {
      try {
        const zonesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/zones`, {
          credentials: 'include',
        });
        if (!zonesResponse.ok) {
          const errorText = await zonesResponse.text();
          console.error('❌ 지역 응답 오류:', zonesResponse.status, errorText);
          throw new Error(`지역 목록 불러오기 실패: ${zonesResponse.status}`);
        }
        const zonesData = await zonesResponse.json();
        setZones(zonesData.zones || []);
      } catch (error) {
        console.error('❌ 지역 목록 불러오기 실패:', error);
      }
    };

    fetchData();
    fetchZones(); // 지역 목록도 함께 호출
  }, [id]);

  // 댓글을 추가하는 함수
  const handleAddComment = async () => {
    if (!newComment.trim()) { // 빈 댓글 방지
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization' 헤더는 credentials: 'include'와 함께 사용될 때 세션 쿠키를 대신 전달하므로 생략 가능
          // 만약 JWT 토큰을 사용하는 경우라면 아래 주석 처리된 라인 활성화
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newComment }),
        credentials: 'include', // 인증 정보를 포함하여 요청
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 새 댓글 응답 데이터:', data.comment); // 새 댓글 응답 데이터 확인 로그

        setComments((prevComments) => [...prevComments, data.comment]); // 백엔드 응답에서 comment 객체를 직접 사용
        setNewComment(''); // 댓글 입력창 초기화
      } else {
        const errorData = await response.json(); // 에러 응답 파싱
        alert(`댓글 작성 실패: ${errorData.message}`); // 상세 에러 메시지 알림
      }
    } catch (error) {
      console.error('❌ 댓글 추가 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 수정 처리 함수
  const handleUpdatePost = async () => {
    // 필수 필드 유효성 검사
    if (!editForm.title || !editForm.min_price || !editForm.deadline || !editForm.zone_id) {
      alert('모든 필수 필드를 입력하세요.');
      return;
    }

    // 서버로 보낼 데이터 형식에 맞게 변환
    const formattedForm = {
      title: editForm.title,
      content: editForm.content || null, // 내용이 비어있으면 null로 처리
      min_price: parseInt(editForm.min_price, 10), // 숫자로 변환
      deadline: new Date(editForm.deadline).toISOString(), // ISO 형식으로 변환
      zone_id: parseInt(editForm.zone_id, 10), // 숫자로 변환
    };

    console.log('수정 요청 데이터:', formattedForm); // 디버깅을 위해 요청 데이터 로그

    setIsLoading(true); // 로딩 상태 활성화
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'PATCH', // 또는 'PUT' (백엔드 라우터에 따라)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedForm),
        credentials: 'include', // 인증 정보 포함
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 수정 응답 오류:', response.status, errorText);
        throw new Error(`게시글 수정 실패: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json(); // 응답 데이터 파싱
      console.log('수정 응답 데이터:', responseData); // 디버깅을 위해 응답 데이터 로그

      setPost(responseData.post); // 수정된 게시글 정보로 상태 업데이트
      setIsEditing(false); // 수정 모드 종료
      alert('게시글 수정 성공');
    } catch (error) {
      console.error('❌ 게시글 수정 오류:', error);
      alert(`게시글 수정 중 오류: ${error.message}`); // 사용자에게 에러 메시지 알림
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  // 게시글 삭제 처리 함수
  const handleDeletePost = async () => {
    // 사용자에게 삭제 확인 요청 (window.confirm 사용)
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true); // 로딩 상태 활성화
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include', // 인증 정보 포함
      });

      if (response.ok) {
        alert('게시글 삭제 성공');
        navigate('/main'); // 삭제 성공 시 메인 페이지로 이동
      } else {
        const errorData = await response.json();
        alert(`게시글 삭제 실패: ${errorData.message}`); // 상세 에러 메시지 알림
      }
    } catch (error) {
      console.error('❌ 게시글 삭제 오류:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  // 수정 폼 필드 변경 핸들러
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // handleJoinClick 수정: 상태를 업데이트하여 댓글 섹션 표시
  const handleJoinClick = () => {
    setShowCommentsSection(true); // 댓글 섹션을 보이도록 상태 업데이트
  };

  // 게시글 데이터가 로딩 중이거나 아직 없는 경우
  if (isLoading || !post) {
    return (
      <div className="post-detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
        <div>게시글을 불러오는 중...</div>
      </div>
    );
  }

  // 게시글 데이터가 모두 로드된 후 렌더링
  return (
    <div className="post-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>

      {/* 게시글 작성자만 수정/삭제 버튼 보이게 */}
      {user && post.writer_id === user.id && (
        <div className="post-actions">
          <button onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
            {isEditing ? '수정 취소' : '게시글 수정'}
          </button>
          <button onClick={handleDeletePost} disabled={isLoading}>게시글 삭제</button>
        </div>
      )}

      {/* 수정 모드와 일반 보기 모드 전환 */}
      {isEditing ? (
        <div className="edit-form">
          <h3>게시글 수정</h3>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditFormChange}
            placeholder="제목"
            required
          />
          <textarea
            name="content"
            value={editForm.content}
            onChange={handleEditFormChange}
            placeholder="내용"
          />
          <input
            type="number"
            name="min_price"
            value={editForm.min_price}
            onChange={handleEditFormChange}
            placeholder="최소 가격"
            required
          />
          <input
            type="datetime-local"
            name="deadline"
            value={editForm.deadline}
            onChange={handleEditFormChange}
            required
          />
          <select
            name="zone_id"
            value={editForm.zone_id}
            onChange={handleEditFormChange}
            required
          >
            <option value="">지역 선택</option>
            {/* 불러온 지역 목록을 드롭다운에 표시 */}
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
          <button onClick={handleUpdatePost} disabled={isLoading}>
            {isLoading ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      ) : (
        <div className="post-card">
          <h2 className="post-title">{post.title}</h2>
          <div className="post-meta">
            {/* post.Writer는 관계를 통해 들어오는 객체이므로 ?. 사용 */}
            <span>작성자: {post.Writer?.nickname || '알 수 없음'}</span> ·{' '}
            {/* createdAt은 Sequelize에서 자동으로 매핑된 필드 */}
            <span>작성일: {new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <pre className="post-content">{post.content}</pre>
          <p>최소 가격: ${post.min_price}</p>
          <p>마감일: {new Date(post.deadline).toLocaleString()}</p>
          <p>지역: {post.Zone?.name || '알 수 없음'}</p>
          <p>현재 참여 인원: {post.current_participants_count}</p>
          <p>마감 여부: {post.is_closed ? '마감됨' : '진행 중'}</p>
        </div>
      )}

      {/* 참여하기 버튼 */}
      <button className="join-button" onClick={handleJoinClick} disabled={isLoading}>
        참여하기
      </button>

      {/* 댓글 영역: showCommentsSection 상태에 따라 표시 여부 제어 */}
      <div id="comments-section" className="comments-section" style={{ display: showCommentsSection ? 'block' : 'none' }}>
        <h3>댓글</h3>
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p>{comment.content}</p>
                {/* comment.User는 관계를 통해 들어오는 객체이므로 ?. 사용 */}
                <span>작성자: {comment.User?.nickname || '알 수 없음'}</span>
                <br />
                {/* ⭐️⭐️⭐️ 작성일 표시 개선: comment.createdAt (카멜 케이스) 우선 사용 ⭐️⭐️⭐️ */}
                <span>
                  작성일: {
                             comment.createdAt // 백엔드 POST 응답에서 오는 필드
                             ? new Date(comment.createdAt).toLocaleString()
                             : (comment.created_at // 백엔드 GET 응답 또는 폴백 필드
                                ? new Date(comment.created_at).toLocaleString()
                                : '날짜 정보 없음')
                           }
                </span>
              </div>
            ))
          ) : (
            <p>댓글이 없습니다.</p>
          )}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성하세요."
          disabled={isLoading}
        />
        <button onClick={handleAddComment} disabled={isLoading}>댓글 작성</button>
      </div>
    </div>
  );
}
