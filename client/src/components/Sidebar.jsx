import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CheckSquare, LogOut, GraduationCap, Bot } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <GraduationCap size={28} color="var(--primary)" />
        <span>Time<span style={{color: 'var(--primary)'}}>Table</span></span>
      </div>
      
      <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
        <LayoutDashboard size={20} />대시보드
      </NavLink>
      <NavLink to="/timetable" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <CalendarDays size={20} />과목 및 시간표
      </NavLink>
      <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <CheckSquare size={20} />스터디 플래너
      </NavLink>

      <div className="nav-spacer" />
      
      <button onClick={onLogout} className="btn btn-outline" style={{width: '100%', marginBottom: '1rem'}}>
        <LogOut size={18} /> 로그아웃
      </button>

      <NavLink to="/chatbot" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
        color: 'white', 
        marginBottom: '1rem',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
      }}>
        <Bot size={20} /> AI 학습 봇
      </NavLink>

      {user && (
        <div className="user-profile">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{flex: 1, overflow: 'hidden'}}>
            <div style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', textOverflow: 'ellipsis', whiteSpace:'nowrap', overflow:'hidden'}}>{user.username}</div>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>학생 (학업의 신)</div>
          </div>
        </div>
      )}
    </aside>
  );
}
