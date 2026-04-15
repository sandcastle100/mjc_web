import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, Clock, Tag, Calendar, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function Timetable({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 과목 추가 폼
  const [subName, setSubName] = useState('');
  const [subColor, setSubColor] = useState('#57a9c2');
  const [subTime, setSubTime] = useState('');

  // 시험 추가 폼 (과목 ID를 키로 하여 입력 상태 관리)
  const [examInputs, setExamInputs] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, [user.id]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects?user_id=${user.id}`);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;
    try {
      await axios.post(`${API_URL}/subjects`, {
        user_id: user.id,
        name: subName,
        color: subColor,
        time: subTime
      });
      setSubName(''); setSubTime(''); fetchSubjects();
    } catch (err) { console.error(err); }
  };

  const handleAddExam = async (subjectId) => {
    const title = examInputs[subjectId]?.title;
    const date = examInputs[subjectId]?.date;
    if (!title || !date) return;

    try {
      await axios.post(`${API_URL}/subjects/${subjectId}/exams`, { title, date });
      setExamInputs({ ...examInputs, [subjectId]: { title: '', date: '' } });
      fetchSubjects();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('이 과목을 삭제하시겠습니까? (연동된 스터디 플래너 항목도 모두 삭제됩니다)')) {
      await axios.delete(`${API_URL}/subjects/${id}`);
      fetchSubjects();
    }
  };

  return (
    <div className="category-container">
      <div className="page-header" style={{ marginBottom: '4rem' }}>
        <h1 className="page-title">과목 및 시간표 관리</h1>
        <p className="page-subtitle">이번 학기 수강 과목과 시험(D-Day) 일정을 관리하세요.</p>
      </div>

      <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>

        {/* 새 과목 등록 카드 */}
        <div className="card" style={{ flex: '0 0 350px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--primary)" /> 새 과목 등록
          </h2>
          <form onSubmit={handleAddSubject}>
            <div className="input-group">
              <label className="input-label">과목명</label>
              <input type="text" className="input-field" placeholder="예: 대학수학, 거시경제학" value={subName} onChange={e => setSubName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">테마 색상</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input type="color" value={subColor} onChange={e => setSubColor(e.target.value)} style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subColor}</span>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">강의 시간 / 메모</label>
              <input type="text" className="input-field" placeholder="예: 월 10:00 - 11:30" value={subTime} onChange={e => setSubTime(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <Plus size={18} /> 추가하기
            </button>
          </form>
        </div>

        {/* 내 과목 목록 */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>등록된 과목 목록</h2>

          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>로딩 중...</div>
          ) : subjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <BookOpen size={48} opacity={0.3} style={{ margin: '0 auto 1rem' }} />
              <p>등록된 과목이 없습니다.<br />왼쪽 패널에서 과목을 추가해 보세요.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subjects.map(sub => (
                <div key={sub.id} className="card" style={{ borderLeft: `6px solid ${sub.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>{sub.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} /> {sub.time || '시간 정보 없음'}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteSubject(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="삭제">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* 시험 목록 */}
                  <div style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> 시험 및 중요 일정 (D-Day 연동)
                    </h4>

                    {sub.exams && sub.exams.length > 0 && (
                      <ul style={{ listStyle: 'none', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sub.exams.map(exam => (
                          <li key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px dashed var(--border-color)' }}>
                            <span style={{ fontWeight: '500' }}>{exam.title}</span>
                            <span style={{ color: 'var(--primary)' }}>{exam.date}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* 시험 등록 폼 */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="일정 이름 (예: 중간고사)"
                        className="input-field"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        value={examInputs[sub.id]?.title || ''}
                        onChange={e => setExamInputs({ ...examInputs, [sub.id]: { ...examInputs[sub.id], title: e.target.value } })}
                      />
                      <input
                        type="date"
                        className="input-field"
                        style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        value={examInputs[sub.id]?.date || ''}
                        onChange={e => setExamInputs({ ...examInputs, [sub.id]: { ...examInputs[sub.id], date: e.target.value } })}
                      />
                      <button onClick={() => handleAddExam(sub.id)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        저장
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
