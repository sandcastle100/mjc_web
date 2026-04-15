import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, Key, Settings, Loader2 } from 'lucide-react';

const AI_BASE_URL = "https://factchat-cloud.mindlogic.ai/v1/gateway";
const MY_API_URL = "http://localhost:3000/api";

export default function Chatbot({ user }) {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);

  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [userContext, setUserContext] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // 접속 시 사용자 챗봇 기록(DB)과 백그라운드 데이터(과목, 투두) 불러오기
  useEffect(() => {
    const loadAllInitData = async () => {
      try {
        // 병렬 로드
        const [subRes, todoRes, chatRes] = await Promise.all([
          axios.get(`${MY_API_URL}/subjects?user_id=${user.id}`),
          axios.get(`${MY_API_URL}/todos?user_id=${user.id}`),
          axios.get(`${MY_API_URL}/users/${user.id}/chatbot`)
        ]);

        // 1. 컨텍스트 구성
        const subjects = subRes.data;
        const todos = todoRes.data;
        
        let contextMsg = `너는 명지전문대 학생 '${user.username}'의 전담 학습 AI 로봇이야. 학생이 현재 등록해둔 아래 데이터를 바탕으로 친절하고 도움이 되는 조언을 해줘.\n\n`;
        contextMsg += `### [수강 과목 및 시험 일정]\n`;
        if (subjects.length === 0) contextMsg += "등록된 과목 없음.\n";
        subjects.forEach(s => {
          contextMsg += `- ${s.name}: `;
          if (s.exams && s.exams.length > 0) {
            contextMsg += s.exams.map(e => `${e.title}(${e.date})`).join(', ');
          } else {
            contextMsg += "예정된 평가 일정 없음";
          }
          contextMsg += "\n";
        });
        
        contextMsg += `\n### [현재 스터디 플래너 (할 일 목록)]\n`;
        if (todos.length === 0) contextMsg += "등록된 할 일 없음.\n";
        const activeTodos = todos.filter(t => !t.is_completed);
        const completedTodos = todos.filter(t => t.is_completed);
        contextMsg += `* 달성 현황: 완료됨 ${completedTodos.length}개, 진행중(미완료) ${activeTodos.length}개\n`;
        activeTodos.forEach(t => {
          contextMsg += `- [미완료 상태] ${t.subject_name}: ${t.content}\n`;
        });
        setUserContext(contextMsg);

        // 2. 과거 DB 데이터 상태 반영
        const { ai_api_key, ai_selected_model, ai_chat_history } = chatRes.data;
        setApiKey(ai_api_key || '');
        if (ai_chat_history && ai_chat_history.length > 0) {
          setHistory(ai_chat_history);
        }
        
        setInitialLoaded(true);

        // API 키가 있다면 모델 자동 연결 트리거
        if (ai_api_key) {
           triggerModelLoad(ai_api_key, ai_selected_model, ai_chat_history || []);
        }

      } catch (err) {
        console.error("초기 데이터 로드 중 에러", err);
        setInitialLoaded(true);
      }
    };
    loadAllInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.username]);

  // 백엔드 동기화 함수
  const syncToDB = async (k, m, h) => {
    try {
      await axios.put(`${MY_API_URL}/users/${user.id}/chatbot`, {
        ai_api_key: k,
        ai_selected_model: m,
        ai_chat_history: h
      });
    } catch(e) {
      console.error("데이터베이스 동기화 실패", e);
    }
  };

  const triggerModelLoad = async (key, preferredModel, currentHistory = history) => {
    setLoadingModels(true);
    try {
      const res = await fetch(`${AI_BASE_URL}/models/`, {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      const data = await res.json();

      if (data.error) {
        alert('모델 불러오기 실패: ' + data.error.message);
        setModels([]);
      } else {
        setModels(data.data);
        let chosen = '';
        if (preferredModel && data.data.some(m => m.id === preferredModel)) {
          chosen = preferredModel;
        } else {
          const defaultModel = data.data.find(m => m.id === 'claude-sonnet-4-6');
          chosen = defaultModel ? defaultModel.id : data.data[0].id;
        }
        setSelectedModel(chosen);
        // Load가 끝났으니 현재 세팅을 DB에 다시 안전하게 굽기
        syncToDB(key, chosen, currentHistory);
      }
    } catch (e) {
       console.error(e);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleLoadModels = async () => {
    if (!apiKey.trim()) return alert("API 키를 먼저 입력해주세요!");
    triggerModelLoad(apiKey, selectedModel);
  };

  const handleModelChange = (e) => {
    const val = e.target.value;
    setSelectedModel(val);
    syncToDB(apiKey, val, history);
  };

  const clearChat = () => {
    if (window.confirm('대화 기록을 지우시겠습니까?')) {
      setHistory([]);
      syncToDB(apiKey, selectedModel, []);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert('API 키를 세팅하고 연결 버튼을 눌러주세요.');
    if (!selectedModel) return alert('모델을 선택해주세요.');
    if (!userInput.trim()) return;

    const text = userInput.trim();
    setUserInput('');

    const newChat = [...history, { role: 'user', content: text }];
    setHistory(newChat);
    setIsTyping(true);
    
    syncToDB(apiKey, selectedModel, newChat); // 사용자 메시지 선 저장

    const messagesToSend = newChat.map((msg, idx) => {
      if (idx === 0 && userContext) {
        return { ...msg, content: `${userContext}\n\n[위 데이터 확인을 완료했으면, 아래 내 질문에 대답해줘]\n${msg.content}` };
      }
      return msg;
    });

    try {
      const res = await fetch(`${AI_BASE_URL}/chat/completions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: selectedModel, messages: messagesToSend })
      });

      const data = await res.json();
      const apiError = data.error || data.detail;
      
      let finalChat = [];
      if (apiError) {
        const errMsg = typeof apiError === 'string' ? apiError : (apiError.message || JSON.stringify(apiError));
        finalChat = [...newChat, { role: 'assistant', content: `[API 통신 거부]: ${errMsg}` }];
      } else if (data.choices && data.choices.length > 0) {
        const reply = data.choices[0].message.content;
        finalChat = [...newChat, { role: 'assistant', content: reply }];
      } else {
        const errorDetails = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        finalChat = [...newChat, { role: 'assistant', content: `[알 수 없는 응답 포맷]\n원인 분석을 위해 아래 내용을 확인해주세요:\n${errorDetails}` }];
      }
      
      setHistory(finalChat);
      syncToDB(apiKey, selectedModel, finalChat);

    } catch (e) {
      const finalChat = [...newChat, { role: 'assistant', content: `[네트워크 통신 오류]: ${e.message}` }];
      setHistory(finalChat);
      syncToDB(apiKey, selectedModel, finalChat);
    } finally {
      setIsTyping(false);
    }
  };

  if (!initialLoaded) {
     return <div style={{padding:'2rem', textAlign:'center', color:'var(--text-muted)'}}><Loader2 size={32} className="lucide-spin" style={{margin:'0 auto'}}/></div>;
  }

  return (
    <div className="category-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 6rem)' }}>
      <div className="page-header" style={{ marginBottom: '1rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={34} color="var(--primary)" /> 학습 봇 AI
          </h1>
          <p className="page-subtitle">나의 시간표와 할 일 데이터베이스를 열람하고 맞춤 조언을 해주는 AI입니다.</p>
        </div>
        <button onClick={clearChat} className="btn btn-outline" style={{padding:'0.5rem 1rem', fontSize:'0.85rem'}}>
          대화 초기화
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Key size={20} color="var(--text-muted)" />
            <input
              type="password"
              className="input-field"
              placeholder="제공받은 API 키 입력"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ padding: '0.6rem 0.85rem' }}
            />
            <button className="btn btn-outline" onClick={handleLoadModels} disabled={loadingModels} style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}>
              {loadingModels ? <Loader2 size={18} className="lucide-spin" /> : '연결'}
            </button>
          </div>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Settings size={20} color="var(--text-muted)" />
            <select
              className="input-field"
              style={{ padding: '0.6rem 0.85rem', width: '100%' }}
              value={selectedModel}
              onChange={handleModelChange}
              disabled={models.length === 0}
            >
              {models.length === 0 && <option value="">API 연결 시 선택 가능</option>}
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
        <div className="chat-box" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', scrollBehavior: 'smooth', paddingRight: '0.5rem' }}>
          {history.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <Bot size={64} opacity={0.2} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>연결 후 자유롭게 학습과 관련된 질문을 시작하세요!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>예: "이번 주에 다가오는 시험 알려줘", "내가 마치지 못한 숙제 위주로 하루 계획 짜줘"</p>
            </div>
          ) : (
            history.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-color)',
                color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-lg)',
                borderBottomLeftRadius: msg.role === 'user' ? 'var(--radius-lg)' : '4px',
                maxWidth: '75%',
                lineHeight: '1.6',
                border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                boxShadow: msg.role === 'user' ? 'var(--shadow-md)' : 'none',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            ))
          )}
          {isTyping && (
            <div style={{ alignSelf: 'flex-start', padding: '0.85rem 1.25rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Loader2 size={18} className="lucide-spin" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="학습 관련 궁금한 사항이나 조언을 구해보세요."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            disabled={isTyping}
            style={{ background: 'var(--bg-color)' }}
          />
          <button type="submit" className="btn btn-primary" disabled={isTyping || !userInput.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
