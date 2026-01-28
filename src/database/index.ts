import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let db: Database.Database | null = null;

export const initDatabase = async (): Promise<Database.Database> => {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'utme-cbt.db');

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Run migrations
  runMigrations(db);

  return db;
};

const runMigrations = (database: Database.Database): void => {
  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      registration_number TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );
  `);

  // Create exams table
  database.exec(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      subjects TEXT NOT NULL,
      duration INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passing_score INTEGER NOT NULL,
      instructions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create questions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      image_url TEXT,
      difficulty TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );
  `);

  // Create exam_sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS exam_sessions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      status TEXT DEFAULT 'in-progress',
      answers TEXT,
      time_spent INTEGER DEFAULT 0,
      FOREIGN KEY (exam_id) REFERENCES exams(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create exam_results table
  database.exec(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      wrong_answers INTEGER NOT NULL,
      skipped_questions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      passed INTEGER NOT NULL,
      subject_scores TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (session_id) REFERENCES exam_sessions(id)
    );
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON exam_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_results_user ON exam_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_results_exam ON exam_results(exam_id);
  `);

  // Insert default admin user (password: admin123)
  const adminExists = database
    .prepare('SELECT COUNT(*) as count FROM users WHERE role = ?')
    .get('admin') as { count: number };

  if (adminExists.count === 0) {
    database
      .prepare(
        `INSERT INTO users (id, username, password_hash, email, full_name, role)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        'admin-001',
        'admin',
        '$2b$10$8Z9X8Z9X8Z9X8Z9X8Z9X8O', // This should be bcrypt hashed
        'admin@utme-cbt.com',
        'System Administrator',
        'admin'
      );
  }
};

export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
