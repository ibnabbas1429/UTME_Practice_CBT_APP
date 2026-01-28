import React from 'react';

interface NavigatorProps {
  questions: any[];
  answers: Record<string, string>;
  markedForReview: Set<string>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const Navigator: React.FC<NavigatorProps> = ({
  questions,
  answers,
  markedForReview,
  currentIndex,
  onNavigate,
}) => {
  const getQuestionStatus = (question: any, index: number) => {
    if (index === currentIndex) return 'current';
    if (answers[question.id]) return 'answered';
    if (markedForReview.has(question.id)) return 'marked';
    return 'unanswered';
  };

  const answered = Object.keys(answers).length;
  const marked = markedForReview.size;
  const unanswered = questions.length - answered;

  return (
    <div className="navigator">
      <h3>Question Navigator</h3>

      <div className="navigator-stats">
        <div className="stat">
          <span className="stat-label">Answered:</span>
          <span className="stat-value">{answered}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Marked:</span>
          <span className="stat-value">{marked}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Not Answered:</span>
          <span className="stat-value">{unanswered}</span>
        </div>
      </div>

      <div className="navigator-legend">
        <div className="legend-item">
          <span className="legend-box current"></span>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <span className="legend-box answered"></span>
          <span>Answered</span>
        </div>
        <div className="legend-item">
          <span className="legend-box marked"></span>
          <span>Marked</span>
        </div>
        <div className="legend-item">
          <span className="legend-box unanswered"></span>
          <span>Not Answered</span>
        </div>
      </div>

      <div className="navigator-grid">
        {questions.map((q, index) => (
          <button
            key={q.id}
            className={`nav-button ${getQuestionStatus(q, index)}`}
            onClick={() => onNavigate(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigator;
