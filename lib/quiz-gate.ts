import type { Module, SavedQuizResult } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { useLearnerProgress } from '@/lib/hooks/useLearner';

type SelfCheckQuiz = Module['selfCheckQuizzes'][number];

/**
 * Lesson order a self-check quiz follows. The API provides it; titles like
 * "(Lessons 1–3)" are parsed as a fallback for cached module data.
 */
export function getQuizAfterLessonOrder(quiz: SelfCheckQuiz): number | null {
  if (quiz.afterLessonOrder != null) return quiz.afterLessonOrder;
  const match = quiz.title.match(/Lessons?\s+(\d+)(?:\s*[–-]\s*(\d+))?/);
  return match ? Number(match[2] ?? match[1]) : null;
}

/**
 * Progress gating for a module: a learner must pass each self-check quiz before
 * moving past the lesson it follows, and pass all of them before the assessment.
 */
export function useModuleGate(module: Module) {
  const { status } = useSession();
  const { data: learnerData } = useLearnerProgress();
  // The progress query only starts once the session is known, so count that wait as loading
  const isLoading = status === 'loading' || (status === 'authenticated' && !learnerData);

  const completedLessonIds = new Set<string>(
    learnerData?.progress?.filter((p: any) => p.completed).map((p: any) => p.lessonId) ?? []
  );
  const passedQuizIds = new Set<string>(learnerData?.passedQuizIds ?? []);
  const quizzes = module.selfCheckQuizzes ?? [];

  /** The quiz taken at the end of this lesson (0-based index), if any */
  const quizForLesson = (lessonIndex: number) =>
    quizzes.find((quiz) => getQuizAfterLessonOrder(quiz) === lessonIndex + 1);

  /** The first unpassed quiz from an earlier lesson that keeps this lesson locked */
  const blockingQuizForLesson = (lessonIndex: number) => {
    // Lessons already completed stay open, e.g. for review
    if (completedLessonIds.has(module.lessons[lessonIndex]?.id)) return undefined;
    return quizzes.find((quiz) => {
      const after = getQuizAfterLessonOrder(quiz);
      return after !== null && after < lessonIndex + 1 && !passedQuizIds.has(quiz.id);
    });
  };

  const completedLessonCount = module.lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const unpassedQuizzes = quizzes.filter((quiz) => !passedQuizIds.has(quiz.id));

  // Saved state, so finished quizzes, the assessment and activities show as done on return
  const latestQuizResults: Record<string, SavedQuizResult> = learnerData?.latestQuizResults ?? {};
  const completedActivityIds = new Set<string>(learnerData?.completedActivityIds ?? []);
  const moduleCertificate = learnerData?.certificates?.find((c: any) => c.moduleId === module.id);

  return {
    isLoading,
    latestQuizResults,
    completedActivityIds,
    moduleCertificate,
    completedLessonIds,
    completedLessonCount,
    passedQuizIds,
    unpassedQuizzes,
    quizForLesson,
    blockingQuizForLesson,
  };
}
