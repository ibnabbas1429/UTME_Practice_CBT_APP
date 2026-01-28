import React from 'react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onStartExam: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onStartExam }) => {
  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: '8px' }}>
              {user.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
            </h1>
            <p style={{ margin: 0, color: '#666' }}>Welcome, {user.fullName}!</p>
          </div>
          <button 
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px' 
        }}>
          <h2 style={{ marginTop: 0 }}>Available Exams</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Select an exam to begin your test
          </p>
          <button 
            onClick={onStartExam}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Start Practice Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
