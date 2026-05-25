'use client';

import { memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lesson } from '@/lib/types';

// Code splitting: Lazy load VideoPlayer (YouTube embed - heavy)
const VideoPlayer = dynamic(
  () => import('./video-player').then(mod => ({ default: mod.VideoPlayer })),
  {
    loading: () => (
      <div className="aspect-video bg-muted animate-pulse rounded-2xl flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading video...</div>
      </div>
    ),
    ssr: false,
  }
);

interface LessonContentProps {
  lesson: Lesson;
  className?: string;
}

export const LessonContent = memo(function LessonContent({ lesson, className }: LessonContentProps) {
  // Parse markdown-like content - memoized to prevent recreation on every render
  const renderContent = useCallback((content: string) => {
    // Handle bold text
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, []);

  return (
    <article className={cn('max-w-none', className)}>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
        {lesson.title}
      </h1>

      {/* Video if present */}
      {lesson.video && (
        <div className="mb-8">
          <VideoPlayer video={lesson.video} />
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {(Array.isArray(lesson.content) ? lesson.content : (lesson.content as any)?.sections || []).map((paragraph: any, index: number) => {
          // Check if it's a list item
          if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
            return (
              <div key={index} className="flex gap-3 text-muted-foreground leading-relaxed">
                <span className="text-primary flex-shrink-0">•</span>
                <span>{renderContent(paragraph.slice(1).trim())}</span>
              </div>
            );
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-muted-foreground leading-relaxed">
              {renderContent(paragraph)}
            </p>
          );
        })}
      </div>

      {/* Key Insight */}
      {lesson.keyInsight && (
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1.5">Key Insight</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lesson.keyInsight}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});
