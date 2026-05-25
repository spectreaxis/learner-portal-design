'use client';

import { Header } from '@/components/header';
import { ModuleCard } from '@/components/module-card';
import { Award, Clock, BookOpen, Target, Loader2 } from 'lucide-react';
import { useModules } from '@/lib/hooks/useModules';
import { useLearnerProgress } from '@/lib/hooks/useLearner';

export default function LearnPage() {
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: learnerData, isLoading: learnerLoading } = useLearnerProgress();

  const isLoading = modulesLoading || learnerLoading;

  if (isLoading) {
    return (
      <>
        <Header
          title="Course Overview"
          subtitle="IIAIC Basic AI/ML Literacy Course"
        />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <>
      <Header
        title="Course Overview"
        subtitle="IIAIC Basic AI/ML Literacy Course"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Course Description */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Basic AI/ML Literacy Course
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            This comprehensive course will teach you the fundamentals of Artificial Intelligence and Machine Learning.
            No prior technical knowledge required — just curiosity and a willingness to learn. By the end, you&apos;ll
            understand how AI works, where it&apos;s used, and how to think critically about it.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{modules.length} Modules</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{totalLessons} Lessons</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">~3 Hours Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Certificate Included</span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <h2 className="text-base font-semibold text-foreground mb-4">All Modules</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {modules.map((module) => {
            const moduleLessons = module.lessons?.length || 0;
            const completedInModule = learnerData?.progress?.filter(
              (p: any) => p.lesson?.moduleId === module.id && p.completed
            ).length || 0;
            const moduleProgress = moduleLessons > 0
              ? Math.round((completedInModule / moduleLessons) * 100)
              : 0;

            // Check if module is locked
            const isLocked = module.number > 1 && !learnerData?.certificates?.some(
              (cert: any) => cert.module?.number === module.number - 1
            );

            // Find current lesson
            const currentLessonProgress = learnerData?.progress?.find(
              (p: any) => p.lesson?.moduleId === module.id && !p.completed
            );

            return (
              <ModuleCard
                key={module.id}
                module={module}
                progress={moduleProgress}
                currentLessonId={currentLessonProgress?.lessonId}
                isActive={moduleProgress > 0 && moduleProgress < 100}
                isLocked={isLocked}
              />
            );
          })}
        </div>

        {/* Course Completion Info */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/5 via-gold/[0.02] to-transparent border border-gold/20 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Earn Your Certificate</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complete all modules and pass the certification assessments to receive your IIAIC-verified
                certificate, recognised globally under the IIAIC AI Competence Framework.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
