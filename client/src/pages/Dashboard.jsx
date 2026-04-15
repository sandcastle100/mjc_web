import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Calendar, Trophy, AlertCircle, LayoutDashboard, CalendarDays, ListTodo, Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import overviewImg from '../assets/우주 서부의 두 친구.png';
import scheduleImg from '../assets/중세의 계획 세우기.png';
import plannerImg from '../assets/shocked guy.webp';
import botImg from '../assets/흥미로운 순간을 포착한 바이커.png';
import sectionBg from '../assets/mainbg.png';

const API_URL = 'http://localhost:3000/api';

const TabItem = ({ id, active, onClick, icon, title, label }) => (
  <div 
    className={`hero-tab ${active === id ? 'active' : ''}`} 
    onClick={() => onClick(id)}
  >
    <div style={{ padding: '0.5rem' }}>{icon}</div>
    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{label || title}</span>
    <span style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '-0.5rem' }}>{title}</span>
  </div>
);

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, subjectsRes] = await Promise.all([
          axios.get(`${API_URL}/todos?user_id=${user.id}`),
          axios.get(`${API_URL}/subjects?user_id=${user.id}`)
        ]);
        setTodos(todosRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error("데이터 로드 중 오류", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) return <div style={{padding:'3rem', textAlign:'center', color:'var(--text-muted)'}}>데이터를 불러오는 중...</div>;

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.is_completed).length;
  const progressPercent = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  const upcomingExams = subjects
    .flatMap(sub => sub.exams.map(e => ({...e, subject_name: sub.name, subject_color: sub.color})))
    .filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4); 

  const getDDay = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(dateString);
    const diffTime = dDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'D-Day' : `D-${diffDays}`;
  };

  return (
    <div>
      {/* 1. Black Hero Section */}
      <section className="dashboard-black-section" style={{ '--section-bg': `url(${sectionBg})` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.35rem', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-0.03em' }}>
            나에게 딱 맞게 진화하는<br/>완벽한 퍼스널 학업 매니저
          </h1>
          
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
             
             {/* Dashboard Card */}
             <div onClick={() => setActiveTab('dashboard')} className="black-card" style={{ cursor:'pointer', flex: '0 0 250px', height: '280px', borderRadius: '20px', '--bg-img': `url(${overviewImg})`, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
               <div>
                  <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Overview</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.3 }}>한눈에 파악하는<br/>나의 학업 달성률</h3>
               </div>
               <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color: '#ccc', fontWeight: '600', fontSize: '0.8rem' }}>
                 자세히 보기 <ArrowRight size={14} />
               </div>
             </div>

             {/* Timetable Card */}
             <div onClick={() => navigate('/timetable')} className="black-card" style={{ cursor:'pointer', flex: '0 0 250px', height: '280px', borderRadius: '20px', '--bg-img': `url(${scheduleImg})`, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
               <div>
                  <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Schedule</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.3 }}>복잡한 시간표와<br/>다가오는 시험 관리</h3>
               </div>
               <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color: '#ccc', fontWeight: '600', fontSize: '0.8rem' }}>
                 시간표 바로가기 <ArrowRight size={14} />
               </div>
             </div>

             {/* Planner Card */}
             <div onClick={() => navigate('/planner')} className="black-card" style={{ cursor:'pointer', flex: '0 0 250px', height: '280px', borderRadius: '20px', '--bg-img': `url(${plannerImg})`, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
               <div>
                  <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Planner</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.3 }}>과목별 학습 투두리스트<br/>체계적 관리</h3>
               </div>
               <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color: '#ccc', fontWeight: '600', fontSize: '0.8rem' }}>
                 플래너 바로가기 <ArrowRight size={14} />
               </div>
             </div>

             {/* Chatbot Card */}
             <div onClick={() => navigate('/chatbot')} className="black-card" style={{ cursor:'pointer', flex: '0 0 250px', height: '280px', borderRadius: '20px', '--bg-img': `url(${botImg})`, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
               <div>
                  <span style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>AI Advisor</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.3 }}>명지전문대 데이터 연동<br/>퍼스널 AI 챗봇</h3>
               </div>
               <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color: '#ccc', fontWeight: '600', fontSize: '0.8rem' }}>
                 AI 봇 바로가기 <ArrowRight size={14} />
               </div>
             </div>

          </div>
        </div>
      </section>

      {/* 2. White Tab Section */}
      <section className="dashboard-white-section" style={{ backgroundColor: '#ffffff', padding: '3rem 3rem 6rem', minHeight: '55vh' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', textAlign: 'center' }}>
           <h2 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '2.5rem', color: '#111827', letterSpacing: '-0.02em' }}>
             다양한 스마트 기능으로 나만의 학업 관리 시스템 구축
           </h2>
           
           {/* Tab Menu */}
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '3rem', color: '#374151' }}>
             <TabItem id="dashboard" active={activeTab} onClick={setActiveTab} icon={<LayoutDashboard size={44}/>} label="Featured" title="대시보드" />
             <TabItem id="timetable" active={activeTab} onClick={setActiveTab} icon={<CalendarDays size={44}/>} label="Schedule" title="과목 및 시간표"  />
             <TabItem id="planner" active={activeTab} onClick={setActiveTab} icon={<ListTodo size={44}/>} label="To-Do" title="스터디 플래너" />
             <TabItem id="chatbot" active={activeTab} onClick={setActiveTab} icon={<Bot size={44}/>} label="AI Advisor" title="AI 학습 봇" />
           </div>

           {/* Tab Contents */}
           <div style={{ background: '#f9fafb', borderRadius: '32px', padding: '4rem', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'left', color: '#1f2937' }}>
              
              {/* 대시보드 탭 (기존 홈 위젯 로드) */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '400px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>이번 주 학습 진척 상황</h3>
                    <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '3rem' }}>플래너에 등록한 이번 주 목표 대비 달성률과 예정된 각종 평가 일정을 실시간으로 모니터링합니다.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.2fr)', gap: '2rem' }}>
                      
                      {/* 파이 차트 위젯 */}
                      <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'3rem 2rem', background: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div style={{ position:'relative', width:'200px', height:'200px', display:'flex', alignItems:'center', justifyContent:'center', margin:'1rem 0 2rem' }}>
                          <svg viewBox="0 0 36 36" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-color)" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeDasharray={`${progressPercent}, 100`} strokeLinecap="round" style={{transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)'}} />
                          </svg>
                          <div style={{position:'absolute', fontSize:'3rem', fontWeight:'800', color:'var(--primary)'}}>
                            {progressPercent}<span style={{fontSize:'1.5rem'}}>%</span>
                          </div>
                        </div>
                        <p style={{color:'var(--text-muted)', fontSize:'1.1rem', fontWeight:'600'}}>
                          총 {totalTodos}개의 스터디 중 <span style={{color:'var(--success)'}}>{completedTodos}개</span> 완료
                        </p>
                      </div>

                      {/* D-Day 위젯 */}
                      <div className="card" style={{ display:'flex', flexDirection:'column', background: '#ffffff', borderColor: '#e5e7eb' }}>
                        <h4 style={{fontSize:'1.25rem', fontWeight:'700', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', color: '#111827'}}><Calendar size={24} color="var(--primary)"/> 다가오는 중요 일정</h4>
                        <div style={{flex:1, display:'flex', flexDirection:'column', gap:'1rem'}}>
                          {upcomingExams.length === 0 ? (
                            <div style={{padding:'2rem', textAlign:'center', color:'var(--text-muted)', background:'var(--bg-color)', borderRadius:'12px'}}>일정이 없습니다.</div>
                          ) : upcomingExams.map(exam => (
                            <div key={exam.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', borderRadius:'var(--radius-md)', background:'#f3f4f6', borderLeft:`4px solid ${exam.subject_color || 'var(--primary)'}`}}>
                              <div>
                                <div style={{fontSize:'0.85rem', color:'#4b5563', fontWeight:'600'}}>{exam.subject_name}</div>
                                <div style={{fontWeight:'700', fontSize:'1.1rem', margin:'0.2rem 0', color: '#111827'}}>{exam.title}</div>
                              </div>
                              <div style={{ background: getDDay(exam.date) === 'D-Day' ? 'var(--danger)' : '#fee2e2', color: getDDay(exam.date) === 'D-Day' ? 'white' : 'var(--danger)', padding:'0.5rem 1rem', borderRadius:'20px', fontWeight:'800' }}>
                                {getDDay(exam.date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* 시간표 탭 */}
              {activeTab === 'timetable' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>시간표 디자인 에디터</h3>
                  <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth:'800px', lineHeight:'1.7' }}>
                    등록된 수강 과목을 요일별로 분류하여 세련된 타임 테이블 형태로 볼 수 있습니다. 과목별로 색상을 지정하고 연결된 시험 날짜들을 등록해 체계적으로 관리하세요.
                  </p>
                  <button onClick={() => navigate('/timetable')} className="btn btn-primary" style={{ width: 'fit-content', padding:'1rem 2.5rem', fontSize:'1.1rem' }}>과목 및 시간표로 이동</button>
                </div>
              )}

              {/* 플래너 탭 */}
              {activeTab === 'planner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>통합 연동형 스터디 플래너</h3>
                  <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth:'800px', lineHeight:'1.7' }}>
                    등록한 '수강 과목' 데이터를 플래너에서 바로 불러와 할 일을 추가할 수 있습니다. 할 일을 마치면 체크박스를 눌러 대시보드의 달성률 그래프를 100%로 채워보세요!
                  </p>
                  <button onClick={() => navigate('/planner')} className="btn btn-primary" style={{ width: 'fit-content', padding:'1rem 2.5rem', fontSize:'1.1rem' }}>스터디 플래너로 이동</button>
                </div>
              )}

              {/* 챗봇 탭 */}
              {activeTab === 'chatbot' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>나의 학업 비서, AI 학습 봇</h3>
                  <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth:'800px', lineHeight:'1.7' }}>
                    최신 생성형 AI 모델이 나의 '시간표'와 '플래너' 데이터베이스를 몰래 읽고 현재 상황을 완벽하게 파악합니다. "나 내일 뭐 공부해야 돼?" 라고 질문만 던지면 AI가 최적의 우선순위 조언을 제시합니다!
                  </p>
                  <button onClick={() => navigate('/chatbot')} className="btn btn-primary" style={{ width: 'fit-content', padding:'1rem 2.5rem', fontSize:'1.1rem' }}>AI 학습 봇 채팅창 열기</button>
                </div>
              )}

           </div>
         </div>
      </section>
    </div>
  );
}
