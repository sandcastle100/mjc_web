import React, { useState } from 'react';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/users/register' : '/users/login';
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{display:'flex', justifyContent:'center', marginBottom:'1.5rem', color:'var(--primary)'}}>
          <GraduationCap size={56} />
        </div>
        <h2 style={{textAlign:'center', marginBottom:'2rem', fontSize:'1.8rem', fontWeight:'700'}}>
          {isRegister ? '새로운 계정 등록' : 'Timetable 로그인'}
        </h2>
        
        {error && <div style={{backgroundColor:'var(--danger)', color:'white', padding:'0.85rem', borderRadius:'var(--radius-md)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">사용자 아이디</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem'}}>
            {isRegister ? '가입하고 시작하기' : '안전하게 로그인'}
          </button>
        </form>
        
        <div style={{textAlign:'center', marginTop:'1.75rem', fontSize:'0.9rem', color:'var(--text-muted)'}}>
          {isRegister ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            style={{background:'none', border:'none', color:'var(--primary)', fontWeight:'600', cursor:'pointer', marginLeft:'0.5rem', fontSize:'0.9rem'}}
          >
            {isRegister ? '로그인하기' : '회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
