import { notFound } from 'next/navigation';
import { LessonPageClient } from '@/components/lesson-page-client';
import type { Module } from '@/lib/types';

// Enable ISR with 24-hour revalidation
export const revalidate = 86400;

// Generate static params for all lessons at build time
export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${API_URL}/modules`);
    const modules: Module[] = await res.json();

    const paths: { moduleId: string; lessonId: string }[] = [];

    for (const module of modules) {
      for (const lesson of module.lessons) {
        paths.push({
          moduleId: module.id,
          lessonId: lesson.id,
        });
      }
    }

    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function getLesson(moduleId: string, lessonId: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
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

interface LessonPageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;

  // Fetch lesson and module in parallel
  const [lesson, module] = await Promise.all([
    getLesson(moduleId, lessonId),
    getModule(moduleId),
  ]);

  if (!lesson || !module) {
    notFound();
  }

  // Find lesson index
  const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
  if (lessonIndex === -1) {
    notFound();
  }

  // For now, use default values for progress (will be fetched from API with auth later)
  const currentLessonIndex = 0;

  return (
    <LessonPageClient
      lesson={lesson}
      module={module}
      moduleId={moduleId}
      lessonId={lessonId}
      lessonIndex={lessonIndex}
      currentLessonIndex={currentLessonIndex}
    />
  );
}
