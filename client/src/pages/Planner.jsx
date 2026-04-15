import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Filter, CalendarDays } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function Planner({ user }) {
  const [todos, setTodos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newTodo, setNewTodo] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const [todosRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/todos?user_id=${user.id}`),
        axios.get(`${API_URL}/subjects?user_id=${user.id}`)
      ]);
      setTodos(todosRes.data);
      setSubjects(subjectsRes.data);
      if(subjectsRes.data.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !selectedSubject) return;
    try {
      await axios.post(`${API_URL}/todos`, { subject_id: selectedSubject, content: newTodo });
      setNewTodo('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleToggleTodo = async (id, currentStatus) => {
    try {
      // Optimistic update
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
      await axios.put(`${API_URL}/todos/${id}/toggle`, { is_completed: !currentStatus });
    } catch (err) {
      console.error(err);
      fetchData(); // revert on failure
    }
  };
  
  const handleDeleteTodo = async (id) => {
    try {
      setTodos(todos.filter(t => t.id !== id));
      await axios.delete(`${API_URL}/todos/${id}`);
    } catch(err) {
      fetchData();
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  return (
    <div className="category-container">
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
        <div>
          <h1 className="page-title">스터디 플래너</h1>
          <p className="page-subtitle">과목별로 할 일을 세우고, 완료하여 달성률을 높이세요.</p>
        </div>
        
        {/* 필터 그룹 */}
        <div style={{display:'flex', background:'white', padding:'0.3rem', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-color)'}}>
          <button 
            onClick={() => setFilter('all')} 
            style={{background: filter === 'all' ? 'var(--primary)' : 'transparent', color: filter === 'all' ? 'white' : 'var(--text-muted)', border:'none', padding:'0.5rem 1rem', borderRadius:'var(--radius-md)', cursor:'pointer', fontWeight:'600', transition:'0.2s'}}
          >전체</button>
          <button 
            onClick={() => setFilter('active')}
            style={{background: filter === 'active' ? 'var(--primary)' : 'transparent', color: filter === 'active' ? 'white' : 'var(--text-muted)', border:'none', padding:'0.5rem 1rem', borderRadius:'var(--radius-md)', cursor:'pointer', fontWeight:'600', transition:'0.2s'}}
          >해야 할 일</button>
          <button 
            onClick={() => setFilter('completed')}
            style={{background: filter === 'completed' ? 'var(--primary)' : 'transparent', color: filter === 'completed' ? 'white' : 'var(--text-muted)', border:'none', padding:'0.5rem 1rem', borderRadius:'var(--radius-md)', cursor:'pointer', fontWeight:'600', transition:'0.2s'}}
          >완료 리스트</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:'2rem', background:'white'}}>
        <form onSubmit={handleAddTodo} style={{display:'flex', gap:'1rem'}}>
          <div style={{flex:'0 0 200px'}}>
            <select 
              className="input-field" 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              required
            >
              {subjects.length === 0 && <option value="">과목을 먼저 등록하세요</option>}
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <input 
            type="text" 
            className="input-field" 
            placeholder="어떤 공부를 할 건가요? (예: 3장 요약정리)" 
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            style={{flex: 1}}
            required
            disabled={subjects.length === 0}
          />
          <button type="submit" className="btn btn-primary" disabled={subjects.length === 0}>
            <Plus size={18} /> 기록하기
          </button>
        </form>
      </div>

      {loading ? (
        <div>로딩 중...</div>
      ) : filteredTodos.length === 0 ? (
        <div style={{textAlign:'center', padding:'4rem', color:'var(--text-muted)'}}>
          <Check size={48} opacity={0.3} style={{margin:'0 auto 1rem'}} />
          {filter === 'completed' ? '아직 완료된 투두가 없습니다.' : '표시할 할 일이 없습니다.'}
        </div>
      ) : (
        <div className="todo-list">
          {filteredTodos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
              <div className="todo-left">
                <div 
                  className={`checkbox ${todo.is_completed ? 'checked' : ''}`}
                  onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                >
                  <Check />
                </div>
                <div>
                  <span className="subject-badge" style={{backgroundColor: todo.color || 'var(--primary)'}}>
                    {todo.subject_name}
                  </span>
                  <span className="todo-text" style={{marginLeft:'1rem', fontSize:'1.05rem', fontWeight:'500'}}>{todo.content}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteTodo(todo.id)}
                style={{background:'none', border:'none', color:'var(--danger)', fontSize:'0.8rem', cursor:'pointer', opacity:0.6, transition:'opacity 0.2s'}}
                onMouseOver={e => e.currentTarget.style.opacity = 1}
                onMouseOut={e => e.currentTarget.style.opacity = 0.6}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
