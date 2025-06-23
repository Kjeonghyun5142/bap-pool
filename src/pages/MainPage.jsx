import Login from './pages/Login';
// src/pages/Main.jsx
import React, { useState, useEffect } from 'react';

const Main = () => {
  const [zone, setZone] = useState('zone-a');
  const [posts, setPosts] = useState([]);
  const [nickname, setNickname] = useState('사용자');

  useEffect(() => {
    const savedName = localStorage.getItem('nickname');
    if (savedName) setNickname(savedName);
    fetchPosts(zone);
  }, []);

  useEffect(() => {
    fetchPosts(zone);
  }, [zone]);

  const fetchPosts = async (zoneValue) => {
    try {
      const res = await fetch(`/api/posts?zone=${zoneValue}`);
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('게시글 불러오기 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white flex justify-between items-center px-6 py-4">
        <h2 className="text-xl font-semibold">🍚 밥풀</h2>
        <div className="flex items-center gap-4">
          <span>{nickname}</span>
          <button className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100">
            로그아웃
          </button>
        </div>
      </header>

      {/* Zone Selector */}
      <div className="text-center mt-6">
        <label htmlFor="zone" className="mr-2">📍 밥풀존 선택:</label>
        <select
          id="zone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="zone-a">밥풀존 A (기숙사)</option>
          <option value="zone-b">밥풀존 B (자취방)</option>
          <option value="zone-c">밥풀존 C (기타 지역)</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="max-w-xl mx-auto mt-6 px-4">
        {posts.length > 0 ? (
          posts.map((post, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow mb-4">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <div className="text-sm text-gray-600 mt-1">
                마감: {post.deadline} | 현재 {post.current}/{post.max}명
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">게시글이 없습니다.</p>
        )}
      </div>

      {/* Write Button */}
      <button
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg text-lg hover:bg-indigo-700"
        onClick={() => window.location.href = '/write'}
      >
        + 글쓰기
      </button>
    </div>
  );
};

export default Main;
