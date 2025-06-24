import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import './MyPage.css'; // 공통 스타일 재사용

export default function Write() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    min_price: '',
    deadline: '',
    zone_id: '',
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/zones', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setZones(data);
        if (data.length > 0) {
          setForm(prev => ({ ...prev, zone_id: data[0].id }));
        }
      })
      .catch(err => {
        console.error('❌ 존 목록 불러오기 실패:', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert('✅ 글이 성공적으로 등록되었습니다!');
        window.location.href = '/main';
      } else {
        alert('❌ 등록 실패!');
      }
    } catch (err) {
      console.error(err);
      alert('❗ 에러 발생');
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2>📝 글쓰기</h2>
        <BackButton />
      </div>

      <form className="mypage-form" onSubmit={handleSubmit}>
        <label>제목</label>
        <input
          type="text"
          name="title"
          required
          value={form.title}
          onChange={handleChange}
        />

        <label>내용</label>
        <textarea
          name="content"
          rows="5"
          required
          value={form.content}
          onChange={handleChange}
        />

        <label>최소 주문 금액</label>
        <input
          type="number"
          name="min_price"
          required
          value={form.min_price}
          onChange={handleChange}
        />

        <label>마감일</label>
        <input
          type="datetime-local"
          name="deadline"
          required
          value={form.deadline}
          onChange={handleChange}
        />

        <label>밥풀존 선택</label>
        <select
          name="zone_id"
          required
          value={form.zone_id}
          onChange={handleChange}
        >
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>
              {zone.name} ({zone.address})
            </option>
          ))}
        </select>

        <button type="submit">등록하기</button>
      </form>
    </div>
  );
}
