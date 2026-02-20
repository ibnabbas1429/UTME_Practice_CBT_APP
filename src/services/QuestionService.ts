import { getDatabase } from '@/database';
import { Question } from '@/shared/types/exam.types';
import { randomUUID } from 'crypto';

export class QuestionService {
  private db = getDatabase();

  async getQuestionsByExam(examId: string): Promise<Question[]> {
    const questions = this.db
      .prepare('SELECT * FROM questions WHERE exam_id = ?')
      .all(examId) as any[];
    return questions.map(this.mapToQuestion);
  }

  async addQuestion(question: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO questions (id, exam_id, subject, question, option_a, option_b, 
         option_c, option_d, correct_answer, explanation, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        question.examId,
        question.subject,
        question.question,
        question.options.A,
        question.options.B,
        question.options.C,
        question.options.D,
        question.correctAnswer,
        question.explanation || null,
        question.difficulty
      );
    return this.getQuestionById(id);
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const updates: string[] = [];
    const values: any[] = [];

    if (question.subject) {
      updates.push('subject = ?');
      values.push(question.subject);
    }
    if (question.question) {
      updates.push('question = ?');
      values.push(question.question);
    }
    if (question.options) {
      updates.push('option_a = ?', 'option_b = ?', 'option_c = ?', 'option_d = ?');
      values.push(question.options.A, question.options.B, question.options.C, question.options.D);
    }
    if (question.correctAnswer) {
      updates.push('correct_answer = ?');
      values.push(question.correctAnswer);
    }
    if (question.explanation !== undefined) {
      updates.push('explanation = ?');
      values.push(question.explanation);
    }
    if (question.difficulty) {
      updates.push('difficulty = ?');
      values.push(question.difficulty);
    }

    values.push(id);

    if (updates.length > 0) {
      this.db
        .prepare(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`)
        .run(...values);
    }

    return this.getQuestionById(id);
  }

  async deleteQuestion(id: string): Promise<void> {
    this.db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  }

  private async getQuestionById(id: string): Promise<Question> {
    const q = this.db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as any;
    return this.mapToQuestion(q);
  }

  private mapToQuestion(dbQ: any): Question {
    return {
      id: dbQ.id,
      examId: dbQ.exam_id,
      subject: dbQ.subject,
      question: dbQ.question,
      options: {
        A: dbQ.option_a,
        B: dbQ.option_b,
        C: dbQ.option_c,
        D: dbQ.option_d,
      },
      correctAnswer: dbQ.correct_answer,
      explanation: dbQ.explanation,
      imageUrl: dbQ.image_url,
      difficulty: dbQ.difficulty,
      createdAt: new Date(dbQ.created_at),
    };
  }
}
