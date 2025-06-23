import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 👉 샘플 데이터 (나중에 백엔드 연동 가능)
  const post = {
    id,
    title: '마라탕 같이 시켜요!',
    author: '홍길동',
    date: '2025-06-23',
    content: '오늘 저녁 6시에 P동 기숙사에서 마라탕 같이 시킬 분 구해요!\n최소 주문 금액 채워야 해서 2명 더 필요해요~\n연락 주세요!',
  };

  return (
    <div className="post-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>

      <div className="post-card">
        <h2 className="post-title">{post.title}</h2>
        <div className="post-meta">
          <span>{post.author}</span> · <span>{post.date}</span>
        </div>
        <pre className="post-content">{post.content}</pre>
      </div>
    </div>
  );
}
