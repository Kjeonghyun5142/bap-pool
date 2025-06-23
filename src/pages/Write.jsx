// src/pages/Write.jsx
import React, { useState, useEffect } from 'react';

const Write = () => {
  const [zones, setZones] = useState([]); // 서버에서 받은 zone 목록 저장
  const [form, setForm] = useState({
    title: '',
    content: '',
    min_price: '',
    deadline: '',    // 🔥 추가
    zone_id: '',     // 초기에는 빈 문자열로 시작
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
        console.error('존 목록 불러오기 실패:', err);
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
        alert('글이 성공적으로 등록되었습니다!');
        window.location.href = '/main';
      } else {
        alert('등록 실패!');
      }
    } catch (err) {
      console.error(err);
      alert('에러 발생');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">글쓰기</h2>

        <label className="block mt-4">제목</label>
        <input
          type="text"
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">내용</label>
        <textarea
          name="content"
          rows="5"
          value={form.content}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">최소 주문 금액</label>
        <input
          type="number"
          name="min_price"
          required
          value={form.min_price}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">마감일</label>
        <input
          type="datetime-local"
          name="deadline"
          required
          value={form.deadline}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">밥풀존 선택</label>
        <select
          name="zone_id"
          value={form.zone_id}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        >
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>
              {zone.name} ({zone.address})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded mt-6 hover:bg-indigo-700"
        >
          등록하기
        </button>
      </form>
    </div>
  );
};

export default Write;
