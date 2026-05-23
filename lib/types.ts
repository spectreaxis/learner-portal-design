export interface VideoLesson {
  title: string;
  source: string;
  url: string;
  duration: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: { label: string; text: string }[];
  answer: string;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

export interface Lesson {
  id: string;
  title: string;
  content: string[];
  keyInsight?: string;
  video?: VideoLesson;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  level: string;
  estimatedTime: string;
  description: string;
  learningObjectives: string[];
  lessons: Lesson[];
  selfCheckQuizzes: { title: string; questions: QuizQuestion[] }[];
  handsOnActivity?: {
    title: string;
    description: string;
    whatYouNeed: string[];
    steps: string[];
    reflections?: string[];
  };
  certificationAssessment: {
    questions: QuizQuestion[];
  };
  keyTakeaways: string[];
}

export interface LearnerProgress {
  moduleId: string;
  lessonId: string;
  completed: boolean;
  quizScores: { quizId: string; score: number; maxScore: number }[];
  certificationPassed: boolean;
  completedAt?: Date;
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt: Date;
  progress: LearnerProgress[];
  currentStreak: number;
  totalLessonsCompleted: number;
  certificates: { moduleId: string; earnedAt: Date; certificateId: string }[];
}
