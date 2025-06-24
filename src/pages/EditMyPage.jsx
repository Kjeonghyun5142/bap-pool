import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditMyPage.css';



export default function EditMyPage() {
  const [nickname, setNickname] = useState('');
  const [dormitory, setDormitory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setNickname(data.user.nickname || '');
        setDormitory(data.user.dormitory || '');
      })
      .catch(err => console.error('❌ 유저 정보 불러오기 실패:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nickname, dormitory }),
    });

    if (res.ok) {
      alert('✅ 정보 수정 완료!');
      navigate('/mypage');
    } else {
      const data = await res.json();
      alert(`❌ 수정 실패: ${data.message || '오류 발생'}`);
    }
  };

  return (
    <div className="edit-mypage">
      <h2>✏️ 내 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <label>닉네임:</label>
        <input value={nickname} onChange={e => setNickname(e.target.value)} required />
        <br />
        <label>거주지:</label>
        <input value={dormitory} onChange={e => setDormitory(e.target.value)} />
        <br />
        <button type="submit">수정 완료</button>

    
      </form>
    </div>
  );
}
