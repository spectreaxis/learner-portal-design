import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { ModulePageClient } from '@/components/module-page-client';
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

  return (
    <>
      <Header
        title={`Module ${module.number}`}
        subtitle={module.title}
      />
      <ModulePageClient module={module} moduleId={moduleId} />
    </>
  );
}
