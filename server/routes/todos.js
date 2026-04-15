const express = require('express');
const router = express.Router();
const db = require('../db');

// 특정 사용자의 스터디 플래너 할 일 가져오기 (과목 정보 포함)
router.get('/', (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id is required" });

    const query = `
        SELECT t.*, s.name as subject_name, s.color 
        FROM todos t 
        JOIN subjects s ON t.subject_id = s.id 
        WHERE s.user_id = ?
        ORDER BY t.id DESC
    `;
        
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 할 일(투두) 추가
router.post('/', (req, res) => {
    const { subject_id, content } = req.body;
    db.run('INSERT INTO todos (subject_id, content) VALUES (?, ?)', 
        [subject_id, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, todo: { id: this.lastID, subject_id, content, is_completed: 0 } });
    });
});

// 투두 완료 여부 토글
router.put('/:id/toggle', (req, res) => {
    const id = req.params.id;
    const { is_completed } = req.body; // 0 (false) 또는 1 (true)
    db.run('UPDATE todos SET is_completed = ? WHERE id = ?', [is_completed, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// 투두 삭제
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

module.exports = router;
