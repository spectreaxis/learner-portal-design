/**
 * Self-check quiz placement
 *
 * Quiz titles name the lessons they cover, e.g. "Self-Check Quiz 1 (Lessons 1–3)"
 * or "Self-Check Quiz 3 (Lesson 6)". A quiz is taken after the last lesson it
 * covers, and must be passed before the learner moves past that lesson.
 */

export const SELF_CHECK_QUIZ_TYPE = 'self-check';
export const SELF_CHECK_PASSING_PERCENTAGE = 70;

/** Returns the order of the last lesson a quiz covers, or null if the title names none */
export function getQuizAfterLessonOrder(title: string): number | null {
  const match = title.match(/Lessons?\s+(\d+)(?:\s*[–-]\s*(\d+))?/);
  if (!match) return null;
  return Number(match[2] ?? match[1]);
}

/**
 * Self-check quizzes that must be passed before the given lesson can be completed:
 * every quiz placed at or before that lesson.
 */
export function getQuizzesRequiredForLesson<T extends { title: string; type: string }>(
  quizzes: T[],
  lessonOrder: number
): T[] {
  return quizzes.filter((quiz) => {
    if (quiz.type !== SELF_CHECK_QUIZ_TYPE) return false;
    const afterLessonOrder = getQuizAfterLessonOrder(quiz.title);
    return afterLessonOrder !== null && afterLessonOrder <= lessonOrder;
  });
}
