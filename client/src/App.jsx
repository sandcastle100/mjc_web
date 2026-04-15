import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // keeping import reference just in case but we remove below
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Planner from './pages/Planner';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="app-container">
        <TopNavbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/timetable" element={<Timetable user={user} />} />
            <Route path="/planner" element={<Planner user={user} />} />
            <Route path="/chatbot" element={<Chatbot user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
