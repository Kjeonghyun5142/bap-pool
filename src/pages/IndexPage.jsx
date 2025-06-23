// IndexPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const IndexPage = () => (
  <div className="text-center bg-gray-100 min-h-screen">
    <header className="bg-indigo-600 text-white p-4">
      <h2 className="text-2xl font-bold">🍚 밥풀 BapPool</h2>
      <nav className="mt-2">
        <Link to="/login" className="mx-4 underline">로그인</Link>
        <Link to="/signup" className="mx-4 underline">회원가입</Link>
      </nav>
    </header>

    <section className="mt-20">
    <h1 className="text-4xl font-bold">혼밥 그만! 같이 시켜요!</h1>
      <p className="mt-4 text-lg">기숙사, 자취생들을 위한 배달비 아끼는 플랫폼</p>
      <Link to="/login">
        <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700">
          지금 시작하기
        </button>
      </Link>
    </section>
  </div>
);

export default IndexPage;
