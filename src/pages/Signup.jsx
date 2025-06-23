// src/pages/Signup.jsx
import React, { useState } from 'react';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
    residence: 'dorm',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agreed) {
      alert('약관에 동의해주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert('회원가입 성공!');
        window.location.href = '/login'; // 또는 React Router로 이동
      } else {
        alert('회원가입 실패');
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
        <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

        <label className="block mt-4">이메일</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">비밀번호</label>
        <input
          type="password"
          name="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">닉네임</label>
        <input
          type="text"
          name="nickname"
          required
          value={form.nickname}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block mt-4">거주 형태</label>
        <select
          name="residence"
          value={form.residence}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="dorm">기숙사</option>
          <option value="one_room">자취</option>
          <option value="etc">기타</option>
        </select>

        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="agreed"
            checked={form.agreed}
            onChange={handleChange}
            className="accent-indigo-600"
          />
          <span>약관에 동의합니다</span>
        </label>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded mt-6 hover:bg-indigo-700"
        >
          가입하기
        </button>

        <div className="text-center mt-4 text-sm">
          이미 계정이 있으신가요? <a href="/login" className="text-indigo-600">로그인</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
