export enum IpcChannels {
  // Authentication
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  AUTH_LOGOUT = 'auth:logout',

  // Exam
  EXAM_GET_ALL = 'exam:get-all',
  EXAM_START = 'exam:start',
  EXAM_SUBMIT = 'exam:submit',
  EXAM_SAVE_PROGRESS = 'exam:save-progress',
  EXAM_TIME_UPDATE = 'exam:time-update',
  EXAM_AUTO_SUBMIT = 'exam:auto-submit',

  // Questions
  QUESTION_GET_BY_EXAM = 'question:get-by-exam',
  QUESTION_ADD = 'question:add',
  QUESTION_UPDATE = 'question:update',
  QUESTION_DELETE = 'question:delete',

  // Results
  RESULT_GET = 'result:get',
  RESULT_GET_DETAILS = 'result:get-details',

  // System
  SYSTEM_EXAM_MODE = 'system:exam-mode',
  SYSTEM_CHECK_UPDATES = 'system:check-updates',
}