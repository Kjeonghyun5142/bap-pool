// App.jsx
import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';  
import Login from './pages/Login';
import Signup from './pages/Signup';
import Main from './pages/MainPage'; 
import PostDetail from './pages/PostDetail';
import Write from './pages/Write';
import Intro from './pages/Intro';
import MyPage from './pages/MyPage'; 
import EditMyPage from './pages/EditMyPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />     
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />      
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/write" element={<Write />} />
        <Route path="/intro" element={<Intro />} /> 
        <Route path="/mypage" element={<MyPage />} /> 
        <Route path="/mypage/edit" element={<EditMyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
