const express = require('express');
const router = express.Router();
const db = require('../db');

// 로그인
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, user: { id: row.id, username: row.username } });
        } else {
            res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
    });
});

// 회원가입
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
        if (err) {
            return res.status(400).json({ success: false, message: '이미 존재하는 사용자 이름입니다.' });
        }
        res.json({ success: true, user: { id: this.lastID, username } });
    });
});

// 유저의 챗봇 데이터(API통신키, 선택모델, 대화기록) 조회
router.get('/:id/chatbot', (req, res) => {
    db.get('SELECT ai_api_key, ai_selected_model, ai_chat_history FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        res.json({
            success: true,
            ai_api_key: row.ai_api_key || '',
            ai_selected_model: row.ai_selected_model || '',
            ai_chat_history: row.ai_chat_history ? JSON.parse(row.ai_chat_history) : []
        });
    });
});

// 유저의 챗봇 데이터 업데이트(동기화 백업)
router.put('/:id/chatbot', (req, res) => {
    const { ai_api_key, ai_selected_model, ai_chat_history } = req.body;
    db.run(
        'UPDATE users SET ai_api_key = ?, ai_selected_model = ?, ai_chat_history = ? WHERE id = ?',
        [ai_api_key || '', ai_selected_model || '', JSON.stringify(ai_chat_history || []), req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

module.exports = router;
