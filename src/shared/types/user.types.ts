export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  registrationNumber?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserRegistration {
  username: string;
  password: string;
  email: string;
  fullName: string;
  registrationNumber?: string;
  phone?: string;
}