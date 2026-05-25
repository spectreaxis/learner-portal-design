'use client';

import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, CheckCircle2, Circle, PlayCircle, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Module } from '@/lib/types';
import { ProgressBar } from './progress';

interface ModuleCardProps {
  module: Module;
  progress: number;
  currentLessonId?: string;
  isActive?: boolean;
  isLocked?: boolean;
}

export function ModuleCard({ module, progress, currentLessonId, isActive, isLocked }: ModuleCardProps) {
  const currentLessonIndex = currentLessonId
    ? module.lessons.findIndex(l => l.id === currentLessonId)
    : 0;
  const completedLessons = currentLessonIndex;
  const isCompleted = progress === 100;

  return (
    <div className={cn(
      'group p-5 rounded-2xl bg-card border transition-all duration-200 shadow-sm',
      isLocked ? 'opacity-60' : 'hover:shadow-md',
      isActive ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            isLocked ? 'bg-muted' : isCompleted ? 'bg-success/10' : isActive ? 'bg-primary/10' : 'bg-muted'
          )}>
            {isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <BookOpen className={cn(
                'w-5 h-5',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Module {module.number}
            </p>
            <h3 className="font-semibold text-foreground line-clamp-1">{module.title}</h3>
          </div>
        </div>
        {isLocked && (
          <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        )}
        {!isLocked && isActive && (
          <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            <Sparkles className="w-3 h-3" />
            Active
          </span>
        )}
        {!isLocked && isCompleted && (
          <span className="px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
            Completed
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{module.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          <Clock className="w-3.5 h-3.5" />
          <span>{module.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{module.lessons.length} lessons</span>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-muted/50 capitalize">{module.level}</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">{completedLessons} of {module.lessons.length} lessons</span>
          <span className={cn(
            'font-semibold',
            isCompleted ? 'text-success' : 'text-primary'
          )}>{progress}%</span>
        </div>
        <ProgressBar progress={progress} size="sm" />
      </div>

      {/* CTA */}
      {isLocked ? (
        <div
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          Complete Module {module.number - 1} First
        </div>
      ) : (
        <Link
          href={`/learn/${module.id}`}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all',
            isActive
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
              : isCompleted
              ? 'bg-success/10 text-success hover:bg-success/20'
              : 'bg-muted text-foreground hover:bg-muted/80'
          )}
        >
          {isCompleted ? 'Review Module' : progress > 0 ? 'Continue Learning' : 'Start Module'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

interface LessonListItemProps {
  lesson: { id: string; title: string };
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  moduleId: string;
}

export function LessonListItem({ lesson, index, isCompleted, isCurrent, moduleId }: LessonListItemProps) {
  return (
    <Link
      href={`/learn/${moduleId}/${lesson.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all',
        isCurrent 
          ? 'bg-primary/5 border border-primary/20 shadow-sm' 
          : isCompleted
          ? 'hover:bg-success/5'
          : 'hover:bg-muted/50'
      )}
    >
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
        ) : isCurrent ? (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-primary" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Circle className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {index + 1}. {lesson.title}
        </p>
      </div>
      <ChevronRight className={cn(
        'w-4 h-4 flex-shrink-0 transition-colors',
        isCurrent ? 'text-primary' : 'text-muted-foreground'
      )} />
    </Link>
  );
}
