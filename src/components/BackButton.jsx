import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      // ⭐️ 인라인 스타일을 제거하고 CSS 클래스를 적용합니다. ⭐️
      className="back-button"
    >
      뒤로가기
    </button>
  );
}
