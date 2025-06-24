import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 댓글을 추가하는 함수
  const handleAddComment = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      } else {
        alert('댓글 작성 실패');
      }
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  // 게시글 데이터와 댓글을 불러오는 함수
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postResponse = await fetch(`/api/posts/${id}`);
        const postData = await postResponse.json();
        setPost(postData);

        const commentsResponse = await fetch(`/api/posts/${id}/comments`);
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      } catch (error) {
        console.error('게시글 및 댓글 데이터 불러오기 실패:', error);
        alert('게시글 및 댓글을 불러오는 데 실패했습니다.');
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleJoinClick = () => {
    document.getElementById('comments-section').style.display = 'block';
  };

  return (
    <div className="post-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>

      <div className="post-card">
        <h2 className="post-title">{post?.title}</h2>
        <div className="post-meta">
          <span>{post?.author}</span> · <span>{post?.date}</span>
        </div>
        <pre className="post-content">{post?.content}</pre>
      </div>

      {/* 참여하기 버튼 */}
      <button className="join-button" onClick={handleJoinClick}>참여하기</button>

      {/* 댓글 영역 */}
      <div id="comments-section" className="comments-section" style={{ display: 'none' }}>
        <h3>댓글</h3>
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p>{comment.content}</p>
                <span>작성자: {comment.User?.nickname || '알 수 없음'}</span><br />
                <span>작성일: {new Date(comment.createdAt).toLocaleString()}</span>
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
        />
        <button onClick={handleAddComment}>댓글 작성</button>
      </div>
    </div>
  );
}
