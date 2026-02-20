import { getDatabase } from '@/database';
import { Exam, ExamSession, ExamResult } from '@/shared/types/exam.types';
import { randomUUID } from 'crypto';

export class ExamService {
  private db = getDatabase();

  async getAllExams(): Promise<Exam[]> {
    const exams = this.db.prepare('SELECT * FROM exams WHERE is_active = 1').all() as any[];
    return exams.map(this.mapToExam);
  }

  async getExamById(examId: string): Promise<Exam | null> {
    const exam = this.db.prepare('SELECT * FROM exams WHERE id = ?').get(examId) as any;
    return exam ? this.mapToExam(exam) : null;
  }

  async startExam(examId: string, userId: string = 'current-user'): Promise<ExamSession> {
    const exam = await this.getExamById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Check if user has an active session
    const activeSession = this.db
      .prepare(
        'SELECT * FROM exam_sessions WHERE exam_id = ? AND user_id = ? AND status = ?'
      )
      .get(examId, userId, 'in-progress') as any;

    if (activeSession) {
      return this.mapToSession(activeSession);
    }

    // Create new session
    const sessionId = randomUUID();
    this.db
      .prepare(
        `INSERT INTO exam_sessions (id, exam_id, user_id, status, answers)
         VALUES (?, ?, ?, 'in-progress', '{}')`
      )
      .run(sessionId, examId, userId);

    const session = this.db
      .prepare('SELECT * FROM exam_sessions WHERE id = ?')
      .get(sessionId) as any;

    return this.mapToSession(session);
  }

  async submitExam(
    examId: string,
    answers: Record<string, string>,
    userId: string = 'current-user'
  ): Promise<ExamResult> {
    // Get active session
    const session = this.db
      .prepare(
        'SELECT * FROM exam_sessions WHERE exam_id = ? AND user_id = ? AND status = ?'
      )
      .get(examId, userId, 'in-progress') as any;

    if (!session) {
      throw new Error('No active exam session found');
    }

    // Update session status
    this.db
      .prepare('UPDATE exam_sessions SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
      .run('completed', session.id);

    // Calculate results
    const questions = this.db
      .prepare('SELECT * FROM questions WHERE exam_id = ?')
      .all(examId) as any[];

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedQuestions = 0;
    const subjectScores: Record<string, any> = {};

    questions.forEach(q => {
      const userAnswer = answers[q.id];

      if (!userAnswer) {
        skippedQuestions++;
      } else if (userAnswer === q.correct_answer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }

      // Track subject scores
      if (!subjectScores[q.subject]) {
        subjectScores[q.subject] = { total: 0, correct: 0 };
      }
      subjectScores[q.subject].total++;
      if (userAnswer === q.correct_answer) {
        subjectScores[q.subject].correct++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const exam = await this.getExamById(examId);
    const passed = percentage >= (exam?.passingScore || 50);

    // Calculate subject percentages
    Object.keys(subjectScores).forEach(subject => {
      const score = subjectScores[subject];
      score.percentage = (score.correct / score.total) * 100;
    });

    // Save result
    const resultId = randomUUID();
    this.db
      .prepare(
        `INSERT INTO exam_results 
         (id, exam_id, user_id, session_id, score, total_questions, correct_answers, 
          wrong_answers, skipped_questions, percentage, passed, subject_scores)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        resultId,
        examId,
        userId,
        session.id,
        correctAnswers,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        skippedQuestions,
        percentage,
        passed ? 1 : 0,
        JSON.stringify(subjectScores)
      );

    const result = this.db.prepare('SELECT * FROM exam_results WHERE id = ?').get(resultId) as any;
    return this.mapToResult(result);
  }

  async saveProgress(examId: string, answers: Record<string, string>, userId: string = 'current-user'): Promise<void> {
    this.db
      .prepare('UPDATE exam_sessions SET answers = ? WHERE exam_id = ? AND user_id = ? AND status = ?')
      .run(JSON.stringify(answers), examId, userId, 'in-progress');
  }

  private mapToExam(dbExam: any): Exam {
    return {
      id: dbExam.id,
      title: dbExam.title,
      description: dbExam.description,
      subjects: JSON.parse(dbExam.subjects),
      duration: dbExam.duration,
      totalQuestions: dbExam.total_questions,
      passingScore: dbExam.passing_score,
      instructions: dbExam.instructions,
      isActive: dbExam.is_active === 1,
      createdAt: new Date(dbExam.created_at),
      updatedAt: new Date(dbExam.updated_at),
    };
  }

  private mapToSession(dbSession: any): ExamSession {
    return {
      id: dbSession.id,
      examId: dbSession.exam_id,
      userId: dbSession.user_id,
      startTime: new Date(dbSession.start_time),
      endTime: dbSession.end_time ? new Date(dbSession.end_time) : undefined,
      status: dbSession.status,
      answers: JSON.parse(dbSession.answers || '{}'),
      timeSpent: dbSession.time_spent,
    };
  }

  private mapToResult(dbResult: any): ExamResult {
    return {
      id: dbResult.id,
      examId: dbResult.exam_id,
      userId: dbResult.user_id,
      sessionId: dbResult.session_id,
      score: dbResult.score,
      totalQuestions: dbResult.total_questions,
      correctAnswers: dbResult.correct_answers,
      wrongAnswers: dbResult.wrong_answers,
      skippedQuestions: dbResult.skipped_questions,
      percentage: dbResult.percentage,
      passed: dbResult.passed === 1,
      subjectScores: JSON.parse(dbResult.subject_scores),
      completedAt: new Date(dbResult.completed_at),
    };
  }
}
