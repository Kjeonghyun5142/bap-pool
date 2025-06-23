// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';  
import Login from './pages/Login';
import Signup from './pages/Signup';
import Main from './pages/MainPage'; 
import PostDetail from './pages/PostDetail';
import Write from './pages/Write';

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
      </Routes>
    </Router>
  );
}

export default App;
