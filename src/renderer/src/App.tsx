====================================
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import ExamInterface from './components/Exam/ExamInterface';
import Dashboard from './components/Admin/Dashboard';

type Screen = 'login' | 'exam' | 'dashboard' | 'results';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('exam');
    }
  };

  const handleLogout = async () => {
    await window.electronAPI.logout();
    setUser(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'exam':
        return (
          <ExamInterface
            user={user}
            onLogout={handleLogout}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onStartExam={() => setCurrentScreen('exam')}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <AuthProvider>
      <div className="app">{renderScreen()}</div>
    </AuthProvider>
  );
};

export default App;
