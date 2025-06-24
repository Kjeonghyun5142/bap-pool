import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';
import BackButton from '../components/BackButton';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 변수
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    min_price: '',
    deadline: '',
    zone_id: '',
  });
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 사용자 정보
        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData.user);
        } else {
          console.warn('❌ 사용자 정보 불러오기 실패:', userData.message);
        }

        // 게시글 데이터
        const postResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          credentials: 'include',
        });
        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          throw new Error(`게시글 불러오기 실패: ${postResponse.status} - ${errorText}`);
        }
        const postData = await postResponse.json();
        console.log('📋 게시글 데이터:', postData); // 디버깅: API 응답 확인
        if (postData.post) {
          setPost(postData.post);
          console.log('📅 post.created_at:', postData.post.created_at); // 디버깅: created_at 값 확인
          setComments(postData.post.Comments || []);
          setEditForm({
            title: postData.post.title,
            content: postData.post.content || '',
            min_price: postData.post.min_price.toString(),
            deadline: new Date(postData.post.deadline).toISOString().slice(0, 16),
            zone_id: postData.post.zone_id.toString(),
          });
        } else {
          throw new Error('게시글 데이터가 없습니다.');
        }

        // 지역 데이터
        const zonesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/zones`, {
          credentials: 'include',
        });
        if (!zonesResponse.ok) {
          const errorText = await zonesResponse.text();
          throw new Error(`지역 목록 불러오기 실패: ${zonesResponse.status} - ${errorText}`);
        }
        const zonesData = await zonesResponse.json();
        const fetchedZones = zonesData.zones || zonesData;
        setZones(fetchedZones);
        if (fetchedZones.length > 0 && !editForm.zone_id) {
          setEditForm(prev => ({ ...prev, zone_id: fetchedZones[0].id.toString() }));
        }
      } catch (error) {
        console.error('❌ 데이터 불러오기 실패:', error);
        alert('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 댓글 추가
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      } else {
        const errorData = await response.json();
        alert(`댓글 작성 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('❌ 댓글 추가 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 수정
  const handleUpdatePost = async () => {
    if (!editForm.title || !editForm.min_price || !editForm.deadline || !editForm.zone_id) {
      alert('모든 필수 필드를 입력하세요.');
      return;
    }
    const formattedForm = {
      title: editForm.title,
      content: editForm.content || null,
      min_price: parseInt(editForm.min_price, 10),
      deadline: new Date(editForm.deadline).toISOString(),
      zone_id: parseInt(editForm.zone_id, 10),
    };
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formattedForm),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`게시글 수정 실패: ${response.status} - ${errorText}`);
      }
      const responseData = await response.json();
      setPost(responseData.post);
      setIsEditing(false);
      alert('게시글 수정 성공');
    } catch (error) {
      console.error('❌ 게시글 수정 오류:', error);
      alert(`게시글 수정 중 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        alert('게시글 삭제 성공');
        navigate('/main');
      } else {
        const errorData = await response.json();
        alert(`게시글 삭제 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('❌ 게시글 삭제 오류:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 수정 폼 입력 처리
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 참여 버튼 클릭
  const handleJoinClick = () => {
    if (isPostClosed(post)) {
      alert('마감된 글입니다');
      return;
    }
    setShowCommentsSection(true);
  };

  // 작성일 포맷팅 (MainPage.jsx와 동일, 댓글은 시간 포함)
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) {
      console.warn('⚠️ dateString이 없습니다:', dateString); // 디버깅
      return '날짜 정보 없음';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ 유효하지 않은 날짜:', dateString); // 디버깅
        return '날짜 정보 없음';
      }
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Seoul',
      };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = false;
      }
      return date.toLocaleString('ko-KR', options).replace(/\. /g, '.').replace(/\.$/, '');
    } catch (error) {
      console.error('❌ 날짜 포맷팅 오류:', error, 'dateString:', dateString); // 디버깅
      return '날짜 정보 없음';
    }
  };

  // 상대 시간 계산
  const getRelativeTime = (dateString) => {
    if (!dateString) {
      console.warn('⚠️ dateString이 없습니다:', dateString); // 디버깅
      return '날짜 정보 없음';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ 유효하지 않은 날짜:', dateString); // 디버깅
        return '날짜 정보 없음';
      }
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else if (diffDays < 7) {
        return `${diffDays}일 전`;
      } else {
        return formatDate(dateString);
      }
    } catch (error) {
      console.error('❌ 상대 시간 계산 오류:', error, 'dateString:', dateString); // 디버깅
      return '날짜 정보 없음';
    }
  };

  // 마감 여부 계산
  const isPostClosed = (post) => {
    if (!post || !post.deadline) {
      console.warn('⚠️ post 또는 deadline이 없습니다:', post); // 디버깅
      return post?.is_closed || false;
    }
    try {
      const deadline = new Date(post.deadline);
      const now = new Date();
      return post.is_closed || deadline < now; // is_closed가 true이거나 마감 시간이 지난 경우
    } catch (error) {
      console.error('❌ 마감 여부 계산 오류:', error, 'deadline:', post.deadline); // 디버깅
      return post.is_closed || false;
    }
  };

  // 로딩 상태
  if (isLoading || !post) {
    return (
      <div className="post-detail-container">
        <BackButton />
        <div className="loading">게시글을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <header className="post-detail-header">
        <h2>📄 게시글 상세</h2>
        <BackButton />
      </header>

      <section className="post-detail-section">
        {user && post.writer_id === user.id && (
          <div className="post-actions">
            <button onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
              {isEditing ? '수정 취소' : '게시글 수정'}
            </button>
            <button onClick={handleDeletePost} disabled={isLoading}>게시글 삭제</button>
          </div>
        )}

        {isEditing ? (
          <form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleUpdatePost(); }}>
            <label htmlFor="edit-title">제목</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={editForm.title}
              onChange={handleEditFormChange}
              placeholder="게시글 제목을 입력하세요."
              required
            />
            <label htmlFor="edit-content">내용</label>
            <textarea
              id="edit-content"
              name="content"
              rows="5"
              value={editForm.content}
              onChange={handleEditFormChange}
              placeholder="내용을 입력하세요."
            />
            <label htmlFor="edit-min_price">최소 주문 금액</label>
            <input
              type="number"
              id="edit-min_price"
              name="min_price"
              value={editForm.min_price}
              onChange={handleEditFormChange}
              placeholder="최소 주문 금액을 입력하세요."
              min="0"
              required
            />
            <label htmlFor="edit-deadline">마감일</label>
            <input
              type="datetime-local"
              id="edit-deadline"
              name="deadline"
              value={editForm.deadline}
              onChange={handleEditFormChange}
              required
            />
            <label htmlFor="edit-zone_id">밥풀존 선택</label>
            {zones.length == 0 ? (
              <p>지역 목록을 불러오는 중...</p>
            ) : (
              <select
                id="edit-zone_id"
                name="zone_id"
                value={editForm.zone_id}
                onChange={handleEditFormChange}
                required
              >
                <option value="">지역을 선택해주세요</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id.toString()}>
                    {zone.name} ({zone.address})
                  </option>
                ))}
              </select>
            )}
            <button type="submit" disabled={isLoading || zones.length === 0}>
              {isLoading ? '수정 중...' : '수정 완료'}
            </button>
          </form>
        ) : (
          <div className="post-card">
            <h2 className="post-title">{post.title}</h2>
            <div className="post-meta">
              <span>작성자: {post.Writer?.nickname || '알 수 없음'}</span> ·{' '}
              <span>작성일: {formatDate(post.created_at)}</span>
            </div>
            <pre className="post-content">{post.content}</pre>
            <p>최소 가격: ₩{post.min_price.toLocaleString()}</p>
            <p>마감일: {new Date(post.deadline).toLocaleString()}</p>
            <p>지역: {post.Zone?.name || '알 수 없음'}</p>
            <p>현재 참여 인원: {post.current_participants_count}</p>
            <p>마감 여부: {isPostClosed(post) ? '마감됨' : '진행 중'}</p>
            <p className="post-relative-time">작성: {getRelativeTime(post.created_at)}</p>
          </div>
        )}

        {!isEditing && (
          <button className="join-button" onClick={handleJoinClick} disabled={isLoading || isPostClosed(post)}>
            참여하기
          </button>
        )}

        {!isEditing && (
          <div id="comments-section" className="comments-section" style={{ display: showCommentsSection ? 'block' : 'none' }}>
            <h3>댓글</h3>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <p>{comment.content}</p>
                    <span>작성자: {comment.User?.nickname || '알 수 없음'}</span>
                    <br />
                    <span>작성일: {formatDate(comment.created_at || comment.createdAt, true)}</span>
                  </div>
                ))
              ) : (
                <p>댓글이 없습니다.</p>
              )}
            </div>
            <label htmlFor="new-comment">댓글 작성</label>
            <textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요."
              disabled={isLoading || isPostClosed(post)}
            />
            <button onClick={handleAddComment} disabled={isLoading || isPostClosed(post)}>댓글 작성</button>
          </div>
        )}
      </section>
    </div>
  );
}

