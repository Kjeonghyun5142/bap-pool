import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditMyPage.css';
import BackButton from '../components/BackButton';

export default function EditMyPage() {
  const [nickname, setNickname] = useState('');
  const [dormitory, setDormitory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setNickname(data.user.nickname || '');
          setDormitory(data.user.dormitory || '');
        } else {
          setError('사용자 정보를 불러오지 못했습니다.');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('❌ 유저 정보 불러오기 실패:', err);
        setError('서버 오류로 정보를 불러오지 못했습니다.');
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 클라이언트 측 유효성 검사
    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const body = { nickname, dormitory };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert('✅ 정보 수정 완료!');
        navigate('/mypage');
      } else {
        const data = await res.json();
        setError(`❌ 수정 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('❌ 수정 요청 오류:', err);
      setError('서버 오류로 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정을 취소하고 마이페이지로 돌아가시겠습니까?')) {
      navigate('/mypage');
    }
  };

  return (
    <div className="edit-mypage-container">
      <header className="edit-mypage-header">
        <h2>✏️ 내 정보 수정</h2>
        <BackButton />
      </header>

      <section className="edit-mypage-section">
        {isLoading ? (
          <div className="loading">정보를 불러오는 중...</div>
        ) : (
          <form className="edit-mypage-form" onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요 (2~20자)"
              required
            />
            <label htmlFor="dormitory">거주지</label>
            <input
              id="dormitory"
              type="text"
              value={dormitory}
              onChange={e => setDormitory(e.target.value)}
              placeholder="거주지를 입력하세요"
            />
            <div className="form-actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? '수정 중...' : '수정 완료'}
              </button>
              <button type="button" onClick={handleCancel} disabled={isLoading}>
                취소
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}