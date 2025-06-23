// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';  // ✅ 로그인 전 첫 화면
import Login from './pages/Login';
import Signup from './pages/Signup';
import Main from './pages/MainPage'; // ✅ 로그인 후 메인
import Write from './pages/Write';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />     // 로그인 전 랜딩
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />       // 로그인 후 메인
        <Route path="/write" element={<Write />} />
      </Routes>
    </Router>
  );
}

export default App;
