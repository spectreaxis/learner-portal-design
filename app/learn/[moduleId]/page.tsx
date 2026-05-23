'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { LessonListItem } from '@/components/module-card';
import { ProgressBar } from '@/components/progress';
import { courseModules, mockLearner, getModuleProgress } from '@/lib/course-data';
import { ChevronRight, Clock, Target, BookOpen, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = use(params);
  const module = courseModules.find(m => m.id === moduleId);
  
  if (!module) {
    notFound();
  }

  const progress = mockLearner.progress.find(p => p.moduleId === moduleId);
  const moduleProgress = getModuleProgress(moduleId, mockLearner);
  const currentLessonIndex = progress?.lessonId 
    ? module.lessons.findIndex(l => l.id === progress.lessonId)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="md:ml-[260px] transition-all duration-300">
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
                  <span>{module.lessons.length} lessons</span>
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
                    {currentLessonIndex} of {module.lessons.length} lessons
                  </span>
                  <span className="text-primary font-semibold">{moduleProgress}%</span>
                </div>
                <ProgressBar progress={moduleProgress} size="md" />
              </div>

              <Link
                href={`/learn/${moduleId}/${module.lessons[Math.min(currentLessonIndex, module.lessons.length - 1)].id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                {moduleProgress > 0 ? 'Continue Learning' : 'Start Module'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              Learning Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {module.learningObjectives.map((objective, index) => (
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

          {/* Lessons List */}
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

          {/* Quizzes and Activity Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Self-Check Quizzes */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Self-Check Quizzes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {module.selfCheckQuizzes.length} practice quizzes to test your understanding as you progress through the lessons.
              </p>
              <div className="flex items-center gap-2">
                {module.selfCheckQuizzes.map((quiz, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hands-on Activity */}
            {module.handsOnActivity && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">Hands-On Activity</h3>
                <p className="text-sm font-medium text-foreground mb-2">
                  {module.handsOnActivity.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.handsOnActivity.description.slice(0, 120)}...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
