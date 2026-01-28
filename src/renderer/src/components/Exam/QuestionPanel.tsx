import React from 'react';

interface QuestionPanelProps {
  question: any;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  isMarkedForReview: boolean;
  onAnswer: (answer: string) => void;
  onMarkForReview: () => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isMarkedForReview,
  onAnswer,
  onMarkForReview,
}) => {
  const options = ['A', 'B', 'C', 'D'] as const;

  return (
    <div className="question-panel">
      <div className="question-header">
        <span className="question-number">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="question-subject">{question.subject}</span>
      </div>

      <div className="question-text">{question.question}</div>

      {question.imageUrl && (
        <div className="question-image">
          <img src={question.imageUrl} alt="Question" />
        </div>
      )}

      <div className="options-list">
        {options.map(option => (
          <div
            key={option}
            className={`option ${selectedAnswer === option ? 'selected' : ''}`}
            onClick={() => onAnswer(option)}
          >
            <div className="option-label">{option}</div>
            <div className="option-text">{question.options[option]}</div>
          </div>
        ))}
      </div>

      <div className="question-actions">
        <button
          onClick={onMarkForReview}
          className={`btn-mark ${isMarkedForReview ? 'marked' : ''}`}
        >
          {isMarkedForReview ? '★ Marked for Review' : '☆ Mark for Review'}
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;
