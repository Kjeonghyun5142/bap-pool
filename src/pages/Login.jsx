// src/pages/Login.jsx
import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <form className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-semibold mb-6">로그인</h2>

        <label htmlFor="email" className="block mt-4">
          이메일
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />

        <label htmlFor="password" className="block mt-4">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          로그인
        </button>

        <div className="text-center mt-4 text-sm text-indigo-600">
          <a href="/signup" className="mx-1 hover:underline">
            회원가입
          </a>
          |
          <a href="#" className="mx-1 hover:underline">
            비밀번호 찾기
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
