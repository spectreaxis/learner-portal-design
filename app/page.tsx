'use client';

import { Header } from '@/components/header';
import { ProgressRing } from '@/components/progress';
import { ModuleCard } from '@/components/module-card';
import { courseModules, mockLearner, getModuleProgress, getOverallProgress } from '@/lib/course-data';
import { BookOpen, Target, Award, Clock, Flame, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const overallProgress = getOverallProgress(mockLearner);
  const currentModuleProgress = mockLearner.progress.find(p => !p.completed);
  const currentModule = courseModules.find(m => m.id === currentModuleProgress?.moduleId);

  return (
    <>
      <Header
        title={`Welcome back, ${mockLearner.name.split(' ')[0]}`}
        subtitle="Continue your AI/ML learning journey"
      />
        
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Overall Progress */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <ProgressRing progress={overallProgress} size={56} strokeWidth={5} showLabel={false} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">Course Progress</p>
                </div>
              </div>
            </div>

            {/* Lessons Completed */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockLearner.totalLessonsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Lessons Done</p>
                </div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockLearner.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockLearner.certificates.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Learning Card */}
          {currentModule && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Continue Learning
              </h2>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                        Module {currentModule.number}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground mb-2 text-balance">
                        {currentModule.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {currentModule.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          {currentModule.lessons.length} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/learn/${currentModule.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Course Modules */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Course Modules</h2>
              <Link 
                href="/learn" 
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {courseModules.slice(0, 4).map((module) => {
                const progress = mockLearner.progress.find(p => p.moduleId === module.id);
                const moduleProgress = getModuleProgress(module.id, mockLearner);
                
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    progress={moduleProgress}
                    currentLessonId={progress?.lessonId}
                    isActive={module.id === currentModuleProgress?.moduleId}
                  />
                );
              })}
            </div>
          </div>

          {/* Learning Objectives Preview */}
          {currentModule && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                What You&apos;ll Learn in Module {currentModule.number}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentModule.learningObjectives.slice(0, 4).map((objective, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </>
  );
}
