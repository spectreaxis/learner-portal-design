import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { LessonListItem } from '@/components/module-card';
import { ProgressBar } from '@/components/progress';
import { ChevronRight, Clock, Target, BookOpen, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import type { Module } from '@/lib/types';

// Enable ISR with 24-hour revalidation
export const revalidate = 86400;

// Generate static params for all modules at build time
export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${API_URL}/modules`);
    const modules: Module[] = await res.json();

    return modules.map((module) => ({
      moduleId: module.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function getModule(moduleId: string): Promise<Module | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${API_URL}/modules/${moduleId}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching module:', error);
    return null;
  }
}

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const module = await getModule(moduleId);

  if (!module) {
    notFound();
  }

  // For now, use default values for progress (will be fetched from API with auth later)
  const moduleProgress = 0;
  const currentLessonIndex = 0;

  return (
    <>
      <Header
        title={`Module ${module.number}`}
        subtitle={module.title}
      />
        
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Module Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    Module {module.number}
                  </p>
                  <h1 className="text-xl font-semibold text-foreground text-balance">
                    {module.title}
                  </h1>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {module.description}
              </p>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{module.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{module.lessons?.length || 0} lessons</span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground capitalize">
                  {module.level}
                </span>
              </div>
            </div>

            {/* Progress Card */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {currentLessonIndex} of {module.lessons?.length || 0} lessons
                  </span>
                  <span className="text-primary font-semibold">{moduleProgress}%</span>
                </div>
                <ProgressBar progress={moduleProgress} size="md" />
              </div>

              {module.lessons && module.lessons.length > 0 && (
                <Link
                  href={`/learn/${moduleId}/${module.lessons[Math.min(currentLessonIndex, module.lessons.length - 1)].id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {moduleProgress > 0 ? 'Continue Learning' : 'Start Module'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Learning Objectives */}
          {(module as any).learningObjectives && (module as any).learningObjectives.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Learning Objectives
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(module as any).learningObjectives.map((objective: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons List */}
          {module.lessons && module.lessons.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-foreground mb-4">Lessons</h2>
              <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden divide-y divide-border">
                {module.lessons.map((lesson, index) => (
                  <LessonListItem
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isCompleted={index < currentLessonIndex}
                    isCurrent={index === currentLessonIndex}
                    moduleId={moduleId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quizzes and Activity Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Self-Check Quizzes */}
            {(module as any).quizzes && (module as any).quizzes.length > 0 && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Self-Check Quizzes
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {(module as any).quizzes.length} practice quizzes to test your understanding as you progress through the lessons.
                </p>
                <div className="flex items-center gap-2">
                  {(module as any).quizzes.map((quiz: any, i: number) => (
                    <div key={quiz.id || i} className="w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                      <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hands-on Activity */}
            {(module as any).activities && (module as any).activities.length > 0 && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">Hands-On Activity</h3>
                <p className="text-sm font-medium text-foreground mb-2">
                  {(module as any).activities[0].title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {(module as any).activities[0].description?.slice(0, 120)}...
                </p>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
