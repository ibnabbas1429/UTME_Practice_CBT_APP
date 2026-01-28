import { getDatabase } from '@/database';
import { User, AuthResponse, UserRegistration } from '@/shared/types/user.types';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class AuthService {
  private db = getDatabase();
  private currentUser: User | null = null;

  async login(username: string, password: string): Promise<AuthResponse> {
    const stmt = this.db.prepare(
      'SELECT * FROM users WHERE username = ? AND password_hash = ?'
    );
    const hashedPassword = this.hashPassword(password);
    const user = stmt.get(username, hashedPassword) as any;

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    this.db
      .prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
      .run(user.id);

    this.currentUser = this.mapToUser(user);

    return {
      user: this.currentUser,
      token: this.generateToken(),
    };
  }

  async register(userData: UserRegistration): Promise<AuthResponse> {
    // Check if username or email already exists
    const existing = this.db
      .prepare('SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?')
      .get(userData.username, userData.email) as { count: number };

    if (existing.count > 0) {
      throw new Error('Username or email already exists');
    }

    const userId = uuidv4();
    const hashedPassword = this.hashPassword(userData.password);

    this.db
      .prepare(
        `INSERT INTO users (id, username, password_hash, email, full_name, registration_number, phone, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'student')`
      )
      .run(
        userId,
        userData.username,
        hashedPassword,
        userData.email,
        userData.fullName,
        userData.registrationNumber || null,
        userData.phone || null
      );

    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    this.currentUser = this.mapToUser(user);

    return {
      user: this.currentUser,
      token: this.generateToken(),
    };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private hashPassword(password: string): string {
    // In production, use bcrypt
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      fullName: dbUser.full_name,
      role: dbUser.role,
      registrationNumber: dbUser.registration_number,
      phone: dbUser.phone,
      createdAt: new Date(dbUser.created_at),
      lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : undefined,
    };
  }
}
