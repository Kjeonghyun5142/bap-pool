// src/components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.css'; // 👈 CSS 따로 분리

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/'); // IndexPage로 이동
    } catch (err) {
      console.error('❌ 로그아웃 실패:', err);
      alert('로그아웃 실패');
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      로그아웃
    </button>
  );
}
