import { IpcMain, BrowserWindow } from 'electron';
import { IpcChannels } from './channels';
import { AuthService } from '@/services/AuthService';
import { ExamService } from '@/services/ExamServices';
import { QuestionService } from '@/services/QuestionService';
import { ResultService } from '@/services/ResultService';
import { enableExamMode } from '../index';

export const registerIpcHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow): void => {
  const authService = new AuthService();
  const examService = new ExamService();
  const questionService = new QuestionService();
  const resultService = new ResultService();

  // Authentication handlers
  ipcMain.handle(IpcChannels.AUTH_LOGIN, async (_event, username: string, password: string) => {
    try {
      return await authService.login(username, password);
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  });

  ipcMain.handle(IpcChannels.AUTH_REGISTER, async (_event, userData: any) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  });

  ipcMain.handle(IpcChannels.AUTH_LOGOUT, async () => {
    await authService.logout();
  });

  // Exam handlers
  ipcMain.handle(IpcChannels.EXAM_GET_ALL, async () => {
    return await examService.getAllExams();
  });

  ipcMain.handle(IpcChannels.EXAM_START, async (_event, examId: string) => {
    const exam = await examService.startExam(examId);

    // Start timer and send updates
    const duration = exam.duration * 60; // Convert to seconds
    let timeLeft = duration;

    const timer = setInterval(() => {
      timeLeft--;
      mainWindow.webContents.send(IpcChannels.EXAM_TIME_UPDATE, timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        mainWindow.webContents.send(IpcChannels.EXAM_AUTO_SUBMIT);
      }
    }, 1000);

    return exam;
  });

  ipcMain.handle(IpcChannels.EXAM_SUBMIT, async (_event, examId: string, answers: any) => {
    return await examService.submitExam(examId, answers);
  });

  ipcMain.handle(IpcChannels.EXAM_SAVE_PROGRESS, async (_event, examId: string, answers: any) => {
    await examService.saveProgress(examId, answers);
  });

  // Question handlers
  ipcMain.handle(IpcChannels.QUESTION_GET_BY_EXAM, async (_event, examId: string) => {
    return await questionService.getQuestionsByExam(examId);
  });

  ipcMain.handle(IpcChannels.QUESTION_ADD, async (_event, question: any) => {
    return await questionService.addQuestion(question);
  });

  ipcMain.handle(IpcChannels.QUESTION_UPDATE, async (_event, id: string, question: any) => {
    return await questionService.updateQuestion(id, question);
  });

  ipcMain.handle(IpcChannels.QUESTION_DELETE, async (_event, id: string) => {
    await questionService.deleteQuestion(id);
  });

  // Result handlers
  ipcMain.handle(IpcChannels.RESULT_GET, async (_event, userId?: string) => {
    return await resultService.getResults(userId);
  });

  ipcMain.handle(IpcChannels.RESULT_GET_DETAILS, async (_event, resultId: string) => {
    return await resultService.getResultDetails(resultId);
  });

  // System handlers
  ipcMain.handle(IpcChannels.SYSTEM_EXAM_MODE, async (_event, enable: boolean) => {
    enableExamMode(enable);
  });

  ipcMain.handle(IpcChannels.SYSTEM_CHECK_UPDATES, async () => {
    // Implement update checking logic
    return { updateAvailable: false };
  });
};