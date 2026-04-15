const express = require('express');
const router = express.Router();
const db = require('../db');

// 특정 사용자의 과목과 해당 과목의 시험 정보 가져오기
router.get('/', (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id is required" });

    db.all('SELECT * FROM subjects WHERE user_id = ?', [userId], (err, subjects) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all('SELECT * FROM exams WHERE subject_id IN (SELECT id FROM subjects WHERE user_id = ?)', [userId], (err, exams) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const response = subjects.map(sub => ({
                ...sub,
                exams: exams.filter(e => e.subject_id === sub.id)
            }));
            res.json(response);
        });
    });
});

// 과목 추가
router.post('/', (req, res) => {
    const { user_id, name, color, time } = req.body;
    db.run('INSERT INTO subjects (user_id, name, color, time) VALUES (?, ?, ?, ?)', 
        [user_id, name, color, time], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, subject: { id: this.lastID, user_id, name, color, time, exams: [] } });
    });
});

// 시험 D-day 추가 
router.post('/:id/exams', (req, res) => {
    const subjectId = req.params.id;
    const { title, date } = req.body;
    db.run('INSERT INTO exams (subject_id, title, date) VALUES (?, ?, ?)', 
        [subjectId, title, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, exam: { id: this.lastID, subject_id: subjectId, title, date } });
    });
});

// 달성한 시험 삭제
router.delete('/exams/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM exams WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// 과목 삭제 (연관된 시험, 할 일 함께 삭제 처리)
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.serialize(() => {
        db.run('DELETE FROM todos WHERE subject_id = ?', [id]);
        db.run('DELETE FROM exams WHERE subject_id = ?', [id]);
        db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, deleted: this.changes });
        });
    });
});

module.exports = router;
