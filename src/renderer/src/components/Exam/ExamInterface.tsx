import React, { useState, useEffect } from 'react';
import QuestionPanel from './QuestionPanel';
import Timer from './Timer';
import Navigator from './Navigator';

interface ExamInterfaceProps {
  user: any;
  onLogout: () => void;
  onBack: () => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ user, onLogout, onBack }) => {
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExam();
  }, []);

  useEffect(() => {
    if (examStarted) {
      // Enable exam mode
      window.electronAPI.enableExamMode(true);

      // Listen for time updates
      const unsubTime = window.electronAPI.onExamTimeUpdate((time: number) => {
        setTimeLeft(time);
      });

      // Listen for auto-submit
      const unsubSubmit = window.electronAPI.onExamAutoSubmit(() => {
        handleSubmit();
      });

      return () => {
        unsubTime();
        unsubSubmit();
        window.electronAPI.enableExamMode(false);
      };
    }
  }, [examStarted]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!examStarted || !exam) return;

    const interval = setInterval(() => {
      window.electronAPI.saveProgress(exam.id, answers);
    }, 30000);

    return () => clearInterval(interval);
  }, [examStarted, exam, answers]);

  const loadExam = async () => {
    const exams = await window.electronAPI.getExams();
    if (exams.length > 0) {
      const selectedExam = exams[0]; // For demo, select first exam
      const examQuestions = await window.electronAPI.getQuestions(selectedExam.id);
      setExam(selectedExam);
      setQuestions(examQuestions);
      setTimeLeft(selectedExam.duration * 60);
    }
  };

  const startExam = async () => {
    if (!exam) return;
    await window.electronAPI.startExam(exam.id);
    setExamStarted(true);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const confirmed = confirm(
      'Are you sure you want to submit? You cannot change your answers after submission.'
    );

    if (!confirmed) return;

    setSubmitting(true);

    try {
      const result = await window.electronAPI.submitExam(exam.id, answers);
      alert(
        `Exam submitted successfully!\n\nScore: ${result.score}/${result.totalQuestions}\nPercentage: ${result.percentage.toFixed(2)}%\n${result.passed ? 'PASSED' : 'FAILED'}`
      );
      window.electronAPI.enableExamMode(false);
      onBack();
    } catch (error: any) {
      alert('Failed to submit exam: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="exam-loading">
        <h2>Loading exam...</h2>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="exam-instructions">
        <div className="instructions-box">
          <h1>{exam.title}</h1>
          <p className="exam-description">{exam.description}</p>

          <div className="exam-details">
            <div className="detail">
              <strong>Duration:</strong> {exam.duration} minutes
            </div>
            <div className="detail">
              <strong>Total Questions:</strong> {exam.totalQuestions}
            </div>
            <div className="detail">
              <strong>Passing Score:</strong> {exam.passingScore}%
            </div>
          </div>

          <div className="instructions-content">
            <h3>Instructions:</h3>
            <p>{exam.instructions}</p>
            <ul>
              <li>Read each question carefully before answering</li>
              <li>You can navigate between questions using the navigator</li>
              <li>Mark questions for review if you want to revisit them</li>
              <li>Your progress is auto-saved every 30 seconds</li>
              <li>The exam will auto-submit when time runs out</li>
              <li>Once submitted, you cannot change your answers</li>
            </ul>
          </div>

          <div className="button-group">
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
            <button onClick={startExam} className="btn-primary">
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-interface">
      <div className="exam-header">
        <div className="exam-title">
          <h2>{exam.title}</h2>
          <span className="user-info">Student: {user.fullName}</span>
        </div>
        <Timer timeLeft={timeLeft} />
      </div>

      <div className="exam-body">
        <div className="question-section">
          <QuestionPanel
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.id]}
            isMarkedForReview={markedForReview.has(currentQuestion.id)}
            onAnswer={answer => handleAnswer(currentQuestion.id, answer)}
            onMarkForReview={() => handleMarkForReview(currentQuestion.id)}
          />

          <div className="navigation-buttons">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))
              }
              disabled={currentQuestionIndex === questions.length - 1}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>

        <div className="navigator-section">
          <Navigator
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            currentIndex={currentQuestionIndex}
            onNavigate={setCurrentQuestionIndex}
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-submit"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
