import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        backgroundColor: '#f3f4f6', // 연회색
        color: '#4f46e5',           // 보라색 글자
        border: 'none',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      🔙 뒤로가기
    </button>
  );
}
