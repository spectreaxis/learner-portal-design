const STORAGE_KEYS = {
  QUIZ_PROGRESS: 'iiaic_quiz_progress',
  LESSON_PROGRESS: 'iiaic_lesson_progress',
} as const;

interface QuizProgress {
  [quizId: string]: {
    selectedAnswers: Record<string, string>;
    submitted: Record<string, boolean>;
    score?: number;
    completedAt?: string;
  };
}

export function saveQuizProgress(quizId: string, data: QuizProgress[string]) {
  try {
    const existing = getQuizProgress();
    localStorage.setItem(
      STORAGE_KEYS.QUIZ_PROGRESS,
      JSON.stringify({ ...existing, [quizId]: data })
    );
  } catch (e) {
    console.warn('Failed to save quiz progress:', e);
  }
}

export function getQuizProgress(): QuizProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function clearQuizProgress(quizId?: string) {
  try {
    if (quizId) {
      const progress = getQuizProgress();
      delete progress[quizId];
      localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
    } else {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
    }
  } catch (e) {
    console.warn('Failed to clear quiz progress:', e);
  }
}
