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
  /** Omitted for certification questions, which are scored server-side */
  answer?: string;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

/** The learner's most recent submission for a quiz or certification */
export interface SavedQuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string>;
  submittedAt: string;
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
  selfCheckQuizzes: { id: string; title: string; questions: QuizQuestion[]; afterLessonOrder?: number | null }[];
  handsOnActivity?: {
    id: string;
    title: string;
    description: string;
    whatYouNeed: string[];
    steps: string[];
    reflections?: string[];
  };
  certificationAssessment: {
    id: string;
    questions: QuizQuestion[];
  };
  keyTakeaways: string[];
}
