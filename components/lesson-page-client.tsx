'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LessonContent } from '@/components/lesson-content';
import { LessonListItem } from '@/components/module-card';
import { ProgressBar } from '@/components/progress';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutGrid,
  X,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Wrench,
  Award,
  Loader2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Module, Lesson } from '@/lib/types';
import { useUpdateProgress, useCompleteActivity } from '@/lib/hooks/useLearner';
import { useModuleGate } from '@/lib/quiz-gate';
import { useMobileSidebar } from '@/components/auth-layout';

// Code splitting: Lazy load QuizSection (heavy component with form logic)
const QuizSection = dynamic(
  () => import('@/components/quiz-section').then(mod => ({ default: mod.QuizSection })),
  {
    loading: () => (
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-24 w-full bg-muted animate-pulse rounded-xl mt-4" />
          <div className="h-24 w-full bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

type ContentTab = 'lesson' | 'quiz' | 'activity' | 'certification';

interface LessonPageClientProps {
  lesson: Lesson;
  module: Module;
  moduleId: string;
  lessonId: string;
  lessonIndex: number;
}

export function LessonPageClient({
  lesson,
  module,
  moduleId,
  lessonId,
  lessonIndex,
}: LessonPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateProgressMutation = useUpdateProgress();
  const completeActivityMutation = useCompleteActivity();
  const gate = useModuleGate(module);
  const { completedLessonIds, completedLessonCount } = gate;
  const [navError, setNavError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setOpen: setMobileNavOpen } = useMobileSidebar();
  const [activeTab, setActiveTab] = useState<ContentTab>('lesson');
  // Saved on the server; the local value only reflects an in-flight toggle
  const [activityToggle, setActivityToggle] = useState<boolean | null>(null);
  const activityCompleted =
    activityToggle ?? (!!module.handsOnActivity && gate.completedActivityIds.has(module.handsOnActivity.id));

  // Check if tab parameter is in URL and set active tab accordingly
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'lesson' || tabParam === 'quiz' || tabParam === 'activity' || tabParam === 'certification')) {
      setActiveTab(tabParam as ContentTab);
    }
  }, [searchParams]);

  const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null;

  // Self-check quiz taken at the end of this lesson; it must be passed to move on
  const relevantQuiz = gate.quizForLesson(lessonIndex);
  const quizPassed = !relevantQuiz || gate.passedQuizIds.has(relevantQuiz.id);

  // An unpassed quiz from an earlier lesson locks this one
  const blockingQuiz = gate.blockingQuizForLesson(lessonIndex);
  const blockingQuizLesson = blockingQuiz
    ? module.lessons.find((_, i) => gate.quizForLesson(i)?.id === blockingQuiz.id)
    : undefined;

  // Check if this is the last lesson (show activity/certification)
  const isLastLesson = lessonIndex === module.lessons.length - 1;

  // The assessment needs every self-check quiz passed and every other lesson completed;
  // this (last) lesson is completed when the learner starts the assessment
  const otherLessonsComplete = module.lessons.every(
    (l) => l.id === lesson.id || completedLessonIds.has(l.id)
  );
  const assessmentUnlocked = gate.unpassedQuizzes.length === 0 && otherLessonsComplete;
  const assessmentStarted = completedLessonIds.has(lesson.id);

  const completeLesson = async () => {
    setNavError('');
    try {
      await updateProgressMutation.mutateAsync({ lessonId: lesson.id, completed: true });
      return true;
    } catch (error: any) {
      setNavError(error?.response?.data?.error || 'Could not save your progress. Please try again.');
      return false;
    }
  };

  const goToNextLesson = async () => {
    if (!nextLesson || !(await completeLesson())) return;
    router.push(`/learn/${moduleId}/${nextLesson.id}`);
  };

  const startAssessment = async () => {
    if (!(await completeLesson())) return;
    setActiveTab('certification');
  };

  const moduleProgress = Math.round(((lessonIndex + 1) / module.lessons.length) * 100);

  // A locked lesson shows only the lock screen, so it gets no extra tabs
  const tabs = blockingQuiz ? [] : [
    { id: 'lesson' as const, label: 'Lesson', icon: BookOpen },
    ...(relevantQuiz ? [{ id: 'quiz' as const, label: 'Quiz', icon: HelpCircle }] : []),
    ...(isLastLesson && module.handsOnActivity ? [{ id: 'activity' as const, label: 'Activity', icon: Wrench }] : []),
    ...(isLastLesson ? [{ id: 'certification' as const, label: 'Assessment', icon: Award }] : []),
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label="Open lesson list"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground truncate mx-4">
          {lesson.title}
        </span>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label="Open main menu"
        >
          <LayoutGrid className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Mobile Lesson Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Lessons</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="p-2">
              {module.lessons.map((l, i) => (
                <LessonListItem
                  key={l.id}
                  lesson={l}
                  index={i}
                  isCompleted={completedLessonIds.has(l.id)}
                  isCurrent={l.id === lessonId}
                  isLocked={!!gate.blockingQuizForLesson(i)}
                  moduleId={moduleId}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* The app layout already offsets content for the main sidebar */}
      <div>
        <div className="flex min-h-screen">
          {/* Lesson Content Area */}
          <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
            {/* Top Progress Bar */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/learn/${moduleId}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Module {module.number}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    Lesson {lessonIndex + 1} of {module.lessons.length}
                  </span>
                </div>
                <ProgressBar progress={moduleProgress} size="sm" />
              </div>

              {/* Content Tabs */}
              <div className="px-6 flex gap-1 border-t border-border pt-3 pb-3 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8 max-w-4xl">
              {/* Wait for saved progress so finished quizzes open on their results */}
              {gate.isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : blockingQuiz ? (
                <div className="max-w-lg mx-auto mt-10 p-8 rounded-2xl bg-card border border-border shadow-sm text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">This lesson is locked</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Pass <strong>{blockingQuiz.title}</strong> to unlock this lesson.
                  </p>
                  {blockingQuizLesson && (
                    <Link
                      href={`/learn/${moduleId}/${blockingQuizLesson.id}?tab=quiz`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Go to Quiz
                    </Link>
                  )}
                </div>
              ) : (
              <>
              {activeTab === 'lesson' && (
                <LessonContent lesson={lesson} />
              )}

              {activeTab === 'quiz' && relevantQuiz && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Test Your Knowledge
                    </h2>
                    <p className="text-muted-foreground">
                      {quizPassed
                        ? 'You passed this quiz. You can retake it any time to practise.'
                        : 'Score at least 70% on this self-check quiz to continue to the next lesson.'}
                    </p>
                  </div>
                  <QuizSection
                    key={relevantQuiz.id}
                    title={relevantQuiz.title}
                    questions={relevantQuiz.questions}
                    quizId={relevantQuiz.id}
                    moduleId={moduleId}
                    savedResult={gate.latestQuizResults[relevantQuiz.id]}
                    onReview={() => setActiveTab('lesson')}
                    continueAction={
                      nextLesson
                        ? { label: 'Continue to Next Lesson', onClick: goToNextLesson }
                        : { label: 'Continue to Assessment', onClick: startAssessment }
                    }
                  />
                </div>
              )}

              {activeTab === 'activity' && module.handsOnActivity && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {module.handsOnActivity.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {module.handsOnActivity.description}
                    </p>
                  </div>

                  {/* What You Need */}
                  <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">What You Need</h3>
                    <ul className="space-y-2">
                      {module.handsOnActivity.whatYouNeed.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">Step-by-Step Instructions</h3>
                    <ol className="space-y-4">
                      {module.handsOnActivity.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                            {i + 1}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Reflections */}
                  {module.handsOnActivity.reflections && (
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                      <h3 className="font-semibold text-foreground mb-3">Reflect</h3>
                      <ul className="space-y-2">
                        {module.handsOnActivity.reflections.map((reflection, i) => (
                          <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {reflection}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Activity Completion Checkbox */}
                  <div className="p-5 rounded-2xl bg-card border-2 border-primary/20 shadow-sm">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={activityCompleted}
                        onChange={async (e) => {
                          const completed = e.target.checked;
                          setActivityToggle(completed);

                          if (module.handsOnActivity?.id) {
                            try {
                              await completeActivityMutation.mutateAsync({
                                activityId: module.handsOnActivity.id,
                                completed
                              });
                            } catch {
                              // Not saved: show the saved state again
                              setActivityToggle(null);
                              return;
                            }
                          }
                          setActivityToggle(null);
                        }}
                        disabled={completeActivityMutation.isPending}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          I have completed this hands-on activity
                        </p>
                        {completeActivityMutation.isPending && (
                          <p className="text-xs text-muted-foreground mt-1">Saving...</p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'certification' && module.certificationAssessment && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Module {module.number} Certification Assessment
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Complete this assessment to earn your certificate. You need to score at least 80% to pass.
                    </p>
                  </div>

                  {!assessmentUnlocked ? (
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Assessment locked</h3>
                          <p className="text-sm text-muted-foreground">
                            Finish these steps to unlock the certification assessment:
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {module.lessons.map((l, i) => {
                          const quiz = gate.quizForLesson(i);
                          const lessonDone = l.id === lesson.id || completedLessonIds.has(l.id);
                          return (
                            <li key={l.id} className="space-y-2">
                              {!lessonDone && (
                                <Link
                                  href={`/learn/${moduleId}/${l.id}`}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  Complete lesson {i + 1}: {l.title}
                                </Link>
                              )}
                              {quiz && !gate.passedQuizIds.has(quiz.id) && (
                                <Link
                                  href={`/learn/${moduleId}/${l.id}?tab=quiz`}
                                  onClick={(e) => {
                                    // Already on this lesson: just switch tabs
                                    if (l.id === lesson.id) {
                                      e.preventDefault();
                                      setActiveTab('quiz');
                                    }
                                  }}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <HelpCircle className="w-4 h-4" />
                                  Pass {quiz.title}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : !assessmentStarted ? (
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm text-center">
                      <h3 className="font-semibold text-foreground mb-2">Ready for your assessment</h3>
                      <p className="text-sm text-muted-foreground mb-5">
                        Starting the assessment marks this lesson as complete. There are{' '}
                        {module.certificationAssessment.questions.length} questions.
                      </p>
                      <button
                        onClick={startAssessment}
                        disabled={updateProgressMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {updateProgressMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                        Start Assessment
                      </button>
                    </div>
                  ) : (
                  <>
                  {/* Readiness Check */}
                  {completedLessonCount < module.lessons.length && (
                    <div className="p-5 rounded-2xl bg-warning/10 border border-warning/30 mb-6">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Complete All Lessons First</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            We recommend completing all {module.lessons.length} lessons before taking the certification assessment.{' '}
                            You&apos;ve completed {completedLessonCount} of {module.lessons.length} lessons so far.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <QuizSection
                    title="Certification Assessment"
                    questions={module.certificationAssessment.questions}
                    key={module.certificationAssessment.id}
                    quizId={module.certificationAssessment.id}
                    moduleId={moduleId}
                    isAssessment
                    savedResult={gate.latestQuizResults[module.certificationAssessment.id]}
                    savedCertificate={gate.moduleCertificate}
                    onComplete={(score, maxScore, certificate) => {
                      const percentage = Math.round((score / maxScore) * 100);
                      if (percentage >= 80 && certificate) {
                        console.log('🎉 Certificate earned!', certificate);
                      }
                    }}
                  />
                  </>
                  )}

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/5 via-gold/[0.02] to-transparent border border-gold/20">
                    <h3 className="font-semibold text-foreground mb-2">Certificate of Completion</h3>
                    <p className="text-sm text-muted-foreground">
                      Upon passing this assessment with 80% or higher, you will receive a certificate verified by Cogniwise Artificial Intelligence Literacy,
                      recognised under the Cogniwise Artificial Intelligence Literacy Framework.
                    </p>
                  </div>
                </div>
              )}
              </>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4">
              {navError && (
                <p className="max-w-4xl mb-3 text-sm text-destructive" role="alert">{navError}</p>
              )}
              <div className="flex items-center justify-between gap-3 max-w-4xl">
                {prevLesson ? (
                  <Link
                    href={`/learn/${moduleId}/${prevLesson.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Link>
                ) : (
                  <div />
                )}

                <span className="text-sm text-muted-foreground hidden md:block truncate max-w-xs">
                  {lesson.title}
                </span>

                {blockingQuiz ? (
                  <div />
                ) : !quizPassed ? (
                  // The lesson's quiz must be passed before moving on
                  activeTab === 'quiz' ? (
                    <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">Pass the quiz to continue</span>
                      <span className="sm:hidden">Pass quiz</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Take Quiz
                    </button>
                  )
                ) : nextLesson ? (
                  <button
                    onClick={goToNextLesson}
                    disabled={updateProgressMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateProgressMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Next Lesson</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : gate.moduleCertificate ? (
                  <Link
                    href={`/certificate/${gate.moduleCertificate.certificateId}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </Link>
                ) : assessmentStarted && activeTab !== 'certification' ? (
                  <button
                    onClick={() => setActiveTab('certification')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>Go to Assessment</span>
                  </button>
                ) : assessmentStarted ? (
                  <div />
                ) : (
                  <button
                    onClick={() => (assessmentUnlocked ? startAssessment() : setActiveTab('certification'))}
                    disabled={updateProgressMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateProgressMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Complete & Take Assessment</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Lesson Sidebar */}
          <aside className="hidden lg:block w-80 border-l border-border bg-card/30 overflow-y-auto">
            <div className="sticky top-0 p-5 border-b border-border bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-1">Module {module.number}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{module.title}</p>
            </div>
            <div className="p-2">
              {module.lessons.map((l, i) => (
                <LessonListItem
                  key={l.id}
                  lesson={l}
                  index={i}
                  isCompleted={completedLessonIds.has(l.id)}
                  isCurrent={l.id === lessonId}
                  isLocked={!!gate.blockingQuizForLesson(i)}
                  moduleId={moduleId}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
