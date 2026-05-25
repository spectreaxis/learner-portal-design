'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LessonContent } from '@/components/lesson-content';
import { LessonListItem } from '@/components/module-card';
import { ProgressBar } from '@/components/progress';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Wrench,
  Award,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Module, Lesson } from '@/lib/types';
import { useUpdateProgress, useCompleteActivity } from '@/lib/hooks/useLearner';

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
  currentLessonIndex: number;
}

export function LessonPageClient({
  lesson,
  module,
  moduleId,
  lessonId,
  lessonIndex,
  currentLessonIndex,
}: LessonPageClientProps) {
  const router = useRouter();
  const updateProgressMutation = useUpdateProgress();
  const completeActivityMutation = useCompleteActivity();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentTab>('lesson');
  const [activityCompleted, setActivityCompleted] = useState(false);

  const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null;

  // Find relevant quiz for this lesson
  const relevantQuizIndex = Math.floor(lessonIndex / 3);
  const relevantQuiz = module.selfCheckQuizzes?.[relevantQuizIndex];

  // Check if this is the last lesson (show activity/certification)
  const isLastLesson = lessonIndex === module.lessons.length - 1;

  const moduleProgress = Math.round(((lessonIndex + 1) / module.lessons.length) * 100);

  const tabs = [
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
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground truncate mx-4">
          {lesson.title}
        </span>
        <div className="w-9" />
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
                  isCompleted={i < currentLessonIndex}
                  isCurrent={l.id === lessonId}
                  moduleId={moduleId}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="md:ml-[260px] transition-all duration-300">
        <div className="flex min-h-screen">
          {/* Lesson Content Area */}
          <div className="flex-1 flex flex-col pt-14 md:pt-0">
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
                      Complete this self-check quiz to reinforce what you&apos;ve learned.
                    </p>
                  </div>
                  <QuizSection
                    title={relevantQuiz.title}
                    questions={relevantQuiz.questions}
                    quizId={relevantQuiz.id}
                    moduleId={moduleId}
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
                          setActivityCompleted(completed);

                          if (module.handsOnActivity?.id) {
                            await completeActivityMutation.mutateAsync({
                              activityId: module.handsOnActivity.id,
                              completed
                            });
                          }
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

                  {/* Readiness Check */}
                  {currentLessonIndex < module.lessons.length && (
                    <div className="p-5 rounded-2xl bg-warning/10 border border-warning/30 mb-6">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Complete All Lessons First</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            We recommend completing all {module.lessons.length} lessons before taking the certification assessment.
                            You&apos;ve completed {currentLessonIndex} of {module.lessons.length} lessons so far.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <QuizSection
                    title="Certification Assessment"
                    questions={module.certificationAssessment.questions}
                    quizId={module.certificationAssessment.id}
                    moduleId={moduleId}
                    onComplete={(score, maxScore, certificate) => {
                      const percentage = Math.round((score / maxScore) * 100);
                      if (percentage >= 80 && certificate) {
                        console.log('🎉 Certificate earned!', certificate);
                      }
                    }}
                  />

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/5 via-gold/[0.02] to-transparent border border-gold/20">
                    <h3 className="font-semibold text-foreground mb-2">Certificate of Completion</h3>
                    <p className="text-sm text-muted-foreground">
                      Upon passing this assessment with 80% or higher, you will receive an IIAIC-verified certificate recognised
                      globally under the IIAIC AI Competence Framework.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4">
              <div className="flex items-center justify-between max-w-4xl">
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

                {nextLesson ? (
                  <button
                    onClick={async () => {
                      // Mark current lesson complete
                      await updateProgressMutation.mutateAsync({
                        lessonId: lesson.id,
                        completed: true
                      });

                      // Navigate to next lesson
                      router.push(`/learn/${moduleId}/${nextLesson.id}`);
                    }}
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
                ) : (
                  <button
                    onClick={async () => {
                      // Mark final lesson complete
                      await updateProgressMutation.mutateAsync({
                        lessonId: lesson.id,
                        completed: true
                      });

                      // Navigate to certificate page
                      router.push('/certificate');
                    }}
                    disabled={updateProgressMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-gold-foreground text-sm font-medium hover:bg-gold/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateProgressMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Complete & Get Certificate</span>
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
                  isCompleted={i < currentLessonIndex}
                  isCurrent={l.id === lessonId}
                  moduleId={moduleId}
                />
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
