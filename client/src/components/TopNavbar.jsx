import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';

export default function TopNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <GraduationCap size={28} />
          <span>MyPlany</span>
        </div>
        <div className="navbar-links">
          <NavLink to="/">대시보드</NavLink>
          <NavLink to="/timetable">과목 및 시간표</NavLink>
          <NavLink to="/planner">스터디 플래너</NavLink>
          <NavLink to="/chatbot">AI 학습 봇</NavLink>
        </div>
        <div className="navbar-user">
          <span className="welcome-text">{user.username}님 환영합니다</span>
          <button onClick={onLogout} className="logout-btn">
            로그아웃 <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
