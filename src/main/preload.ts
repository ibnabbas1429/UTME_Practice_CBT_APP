import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannels } from './ipc/channels';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  login: (username: string, password: string) =>
    ipcRenderer.invoke(IpcChannels.AUTH_LOGIN, username, password),
  register: (userData: any) => ipcRenderer.invoke(IpcChannels.AUTH_REGISTER, userData),
  logout: () => ipcRenderer.invoke(IpcChannels.AUTH_LOGOUT),

  // Exam
  getExams: () => ipcRenderer.invoke(IpcChannels.EXAM_GET_ALL),
  startExam: (examId: string) => ipcRenderer.invoke(IpcChannels.EXAM_START, examId),
  submitExam: (examId: string, answers: any) =>
    ipcRenderer.invoke(IpcChannels.EXAM_SUBMIT, examId, answers),
  saveProgress: (examId: string, answers: any) =>
    ipcRenderer.invoke(IpcChannels.EXAM_SAVE_PROGRESS, examId, answers),

  // Questions
  getQuestions: (examId: string) =>
    ipcRenderer.invoke(IpcChannels.QUESTION_GET_BY_EXAM, examId),
  addQuestion: (question: any) => ipcRenderer.invoke(IpcChannels.QUESTION_ADD, question),
  updateQuestion: (id: string, question: any) =>
    ipcRenderer.invoke(IpcChannels.QUESTION_UPDATE, id, question),
  deleteQuestion: (id: string) => ipcRenderer.invoke(IpcChannels.QUESTION_DELETE, id),

  // Results
  getResults: (userId?: string) => ipcRenderer.invoke(IpcChannels.RESULT_GET, userId),
  getResultDetails: (resultId: string) =>
    ipcRenderer.invoke(IpcChannels.RESULT_GET_DETAILS, resultId),

  // System
  enableExamMode: (enable: boolean) =>
    ipcRenderer.invoke(IpcChannels.SYSTEM_EXAM_MODE, enable),
  checkUpdates: () => ipcRenderer.invoke(IpcChannels.SYSTEM_CHECK_UPDATES),

  // Event listeners
  onExamTimeUpdate: (callback: (timeLeft: number) => void) => {
    ipcRenderer.on(IpcChannels.EXAM_TIME_UPDATE, (_event, timeLeft) => callback(timeLeft));
    return () => ipcRenderer.removeAllListeners(IpcChannels.EXAM_TIME_UPDATE);
  },
  onExamAutoSubmit: (callback: () => void) => {
    ipcRenderer.on(IpcChannels.EXAM_AUTO_SUBMIT, () => callback());
    return () => ipcRenderer.removeAllListeners(IpcChannels.EXAM_AUTO_SUBMIT);
  },
});

// Type definitions for renderer
export interface ElectronAPI {
  login: (username: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  getExams: () => Promise<any[]>;
  startExam: (examId: string) => Promise<any>;
  submitExam: (examId: string, answers: any) => Promise<any>;
  saveProgress: (examId: string, answers: any) => Promise<void>;
  getQuestions: (examId: string) => Promise<any[]>;
  addQuestion: (question: any) => Promise<any>;
  updateQuestion: (id: string, question: any) => Promise<any>;
  deleteQuestion: (id: string) => Promise<void>;
  getResults: (userId?: string) => Promise<any[]>;
  getResultDetails: (resultId: string) => Promise<any>;
  enableExamMode: (enable: boolean) => Promise<void>;
  checkUpdates: () => Promise<any>;
  onExamTimeUpdate: (callback: (timeLeft: number) => void) => () => void;
  onExamAutoSubmit: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}