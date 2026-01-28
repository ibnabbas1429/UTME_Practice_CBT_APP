import { getDatabase } from '@/database';
import { ExamResult } from '@/shared/types/exam.types';

export class ResultService {
  private db = getDatabase();

  async getResults(userId?: string): Promise<ExamResult[]> {
    let query = 'SELECT * FROM exam_results';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY completed_at DESC';
    
    const results = this.db.prepare(query).all(...params) as any[];
    return results.map(this.mapToResult);
  }

  async getResultDetails(resultId: string): Promise<ExamResult | null> {
    const result = this.db
      .prepare('SELECT * FROM exam_results WHERE id = ?')
      .get(resultId) as any;
    return result ? this.mapToResult(result) : null;
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
