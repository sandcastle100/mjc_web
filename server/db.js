const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'timetables.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // 테이블 생성
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )`);
            
            // 기존 users 테이블에 챗봇 정보 저장을 위한 컬럼 동적 추가 (이미 있을 경우의 에러는 콜백에서 자연스럽게 무시처리)
            const addColumn = (table, column, type) => {
                db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, () => {});
            };
            addColumn('users', 'ai_api_key', 'TEXT');
            addColumn('users', 'ai_selected_model', 'TEXT');
            addColumn('users', 'ai_chat_history', 'TEXT');
            
            db.run(`CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                color TEXT,
                time TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS exams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER,
                title TEXT,
                date TEXT,
                FOREIGN KEY (subject_id) REFERENCES subjects (id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER,
                content TEXT,
                is_completed BOOLEAN DEFAULT 0,
                FOREIGN KEY (subject_id) REFERENCES subjects (id)
            )`);
        });
    }
});

module.exports = db;
