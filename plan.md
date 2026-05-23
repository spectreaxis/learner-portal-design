# Performance Optimization & Scalability Implementation Plan

## Context

The learner portal application experiences **severe performance issues** with 450-800ms delays when clicking sidebar items or any interactive elements. The application currently:

- Recreates the Sidebar component on every route change (7 pages × new instance)
- Has no component memoization, causing 4-6 unnecessary re-renders per interaction
- Uses only client-side rendering with hardcoded data (620+ lines)
- Has no backend, database, or caching infrastructure
- Cannot scale beyond ~10-20 concurrent users

**Goal**: Transform this into a production-ready application that:
- Responds to clicks in <100ms (85% faster)
- Loads initially in <1.5s for first-time visitors (60% faster)
- Supports 1000+ concurrent users reliably
- Has proper backend infrastructure with authentication
- Maintains current UI/UX (no user-facing changes)

## Architecture Decision

**Separate Frontend & Backend** (per user request):

```
learner-portal-design/
├── frontend/          # Next.js 16 application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # Frontend utilities, API client
│   └── public/       # Static assets
│
└── backend/          # Express.js REST API (NEW)
    ├── src/
    │   ├── controllers/
    │   ├── models/       # Prisma models
    │   ├── routes/
    │   ├── middleware/
    │   └── services/
    ├── prisma/
    │   └── schema.prisma
    └── package.json
```

## Implementation Phases

### PHASE 1: Frontend Performance Fixes (Quick Wins)
**Impact**: 70-90% reduction in interaction delay | **Timeline**: 1-2 days

#### Critical Files to Modify

**1. Move Sidebar to Root Layout** (PRIMARY FIX - solves 70% of the problem)

**File**: `frontend/app/layout.tsx`

```typescript
'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.className} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <div className="flex min-h-screen">
          {/* Single Sidebar instance for entire app */}
          <Sidebar />

          {/* Main content area with responsive margin */}
          <main className="flex-1 md:ml-[260px] transition-[margin] duration-300">
            {children}
          </main>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
```

**Changes required**:
- Remove `<Sidebar />` from all 7 page files (app/page.tsx, app/learn/page.tsx, etc.)
- Remove redundant `<main className="md:ml-[260px]">` wrappers from all pages
- Change root layout from server component to client component

**Impact**: Eliminates sidebar recreation on every navigation, preserves collapse state

---

**2. Memoize Sidebar Component**

**File**: `frontend/components/sidebar.tsx`

Current issues:
- Line 18-23: `navItems` array recreated on every render
- Line 52-53: `isActive` computed 4 times per render
- Line 32-34: `cn()` utility runs unnecessarily
- Line 94: Toggle function recreated on every render

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, useCallback, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Move outside component - static data (fixes line 18-23)
const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/learn', icon: BookOpen, label: 'Course' },
  { href: '/certificate', icon: Award, label: 'Certificate' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Memoize toggle callback (fixes line 94)
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // Memoize container classes (fixes line 32-34)
  const containerClasses = useMemo(
    () => cn(
      'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
      collapsed ? 'w-[72px]' : 'w-[260px]'
    ),
    [collapsed]
  );

  return (
    <aside className={containerClasses}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-foreground font-semibold text-base tracking-tight">IIAIC</span>
            <span className="text-muted-foreground text-xs">Learning Portal</span>
          </div>
        )}
      </div>

      {/* Navigation - memoized active state calculation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Streak Card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-warning" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">7 day streak</span>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-center h-14 border-t border-sidebar-border text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
});
```

**Impact**: Eliminate 3-4 unnecessary re-renders per navigation

---

**3. Optimize Other Components**

**File**: `frontend/hooks/use-mobile.ts`

Current issue: Sets state twice on mount (line 14), causes double render

```typescript
import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Single state update using mql.matches
    const onChange = () => setIsMobile(mql.matches);

    // Set initial value once
    setIsMobile(mql.matches);

    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
```

**File**: `frontend/components/quiz-section.tsx` (add memoization)

```typescript
import { memo, useMemo } from 'react';

export const QuizSection = memo(function QuizSection({ title, questions, onComplete }: QuizSectionProps) {
  // ... existing state ...

  // Memoize score calculation (currently recalculated on every render)
  const score = useMemo(() =>
    questions.filter(q =>
      selectedAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase()
    ).length,
    [questions, selectedAnswers]
  );

  // ... rest of component
});
```

**File**: `frontend/components/lesson-content.tsx` (memoize rendering)

```typescript
import { memo, useCallback } from 'react';

export const LessonContent = memo(function LessonContent({ lesson, className }: LessonContentProps) {
  const renderContent = useCallback((content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }, []);

  // ... rest
});
```

**File**: `frontend/components/video-player.tsx` (memoize video ID extraction)

```typescript
import { memo, useMemo } from 'react';

export const VideoPlayer = memo(function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = useMemo(() => {
    const match = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  }, [video.url]);

  // ... rest
});
```

---

**4. Remove Transition Delays from Layout**

Remove `transition-all duration-300` from page layouts (keeps it on interactive elements only):

```typescript
// Before: <main className="md:ml-[260px] transition-all duration-300">
// After:  <main className="md:ml-[260px]">  (or remove since it's in root layout now)
```

---

**5. Add Loading States & Skeletons**

**New File**: `frontend/components/skeletons.tsx`

```typescript
export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModuleCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
```

**New File**: `frontend/app/loading.tsx`

```typescript
import { DashboardSkeleton } from '@/components/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

---

### PHASE 2: Data Layer & State Management
**Impact**: Enable API integration, add persistence | **Timeline**: 2-3 days

#### Install Dependencies

```bash
cd frontend
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add axios
pnpm add next-auth
```

#### Setup TanStack Query

**New File**: `frontend/app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

Update `frontend/app/layout.tsx`:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-[260px]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

#### Create API Client

**New File**: `frontend/lib/api-client.ts`

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based sessions
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Create Data Hooks

**New File**: `frontend/lib/hooks/useModules.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Module } from '@/lib/types';

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await apiClient.get<Module[]>('/modules');
      return data;
    },
    staleTime: 5 * 60 * 1000, // Course data changes rarely
  });
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: ['modules', moduleId],
    queryFn: async () => {
      const { data } = await apiClient.get<Module>(`/modules/${moduleId}`);
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useLesson(moduleId: string, lessonId: string) {
  return useQuery({
    queryKey: ['lessons', moduleId, lessonId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/modules/${moduleId}/lessons/${lessonId}`);
      return data;
    },
    enabled: !!moduleId && !!lessonId,
  });
}
```

**New File**: `frontend/lib/hooks/useLearner.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useLearnerProgress() {
  return useQuery({
    queryKey: ['learner', 'progress'],
    queryFn: async () => {
      const { data } = await apiClient.get('/learner/progress');
      return data;
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      const { data } = await apiClient.post('/learner/progress', { lessonId, completed });
      return data;
    },
    onSuccess: () => {
      // Invalidate progress queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: { quizId: string; answers: Record<string, string> }) => {
      const { data } = await apiClient.post('/learner/quizzes', submission);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}
```

#### Add LocalStorage Persistence for Quiz Progress

**New File**: `frontend/lib/storage.ts`

```typescript
const STORAGE_KEYS = {
  QUIZ_PROGRESS: 'iiaic_quiz_progress',
  LESSON_PROGRESS: 'iiaic_lesson_progress',
} as const;

interface QuizProgress {
  [quizId: string]: {
    selectedAnswers: Record<string, string>;
    submitted: Record<string, boolean>;
    score?: number;
    completedAt?: string;
  };
}

export function saveQuizProgress(quizId: string, data: QuizProgress[string]) {
  try {
    const existing = getQuizProgress();
    localStorage.setItem(
      STORAGE_KEYS.QUIZ_PROGRESS,
      JSON.stringify({ ...existing, [quizId]: data })
    );
  } catch (e) {
    console.warn('Failed to save quiz progress:', e);
  }
}

export function getQuizProgress(): QuizProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function clearQuizProgress(quizId?: string) {
  try {
    if (quizId) {
      const progress = getQuizProgress();
      delete progress[quizId];
      localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
    } else {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
    }
  } catch (e) {
    console.warn('Failed to clear quiz progress:', e);
  }
}
```

Update `frontend/components/quiz-section.tsx` to use persistence:

```typescript
import { useEffect } from 'react';
import { saveQuizProgress, getQuizProgress } from '@/lib/storage';

export function QuizSection({ title, questions, onComplete }: QuizSectionProps) {
  // ... existing state ...

  // Load from storage on mount
  useEffect(() => {
    const saved = getQuizProgress()[title];
    if (saved) {
      setSelectedAnswers(saved.selectedAnswers);
      setSubmitted(saved.submitted);
    }
  }, [title]);

  // Save on change
  useEffect(() => {
    saveQuizProgress(title, { selectedAnswers, submitted, score });
  }, [selectedAnswers, submitted, score, title]);

  // ... rest
}
```

---

### PHASE 3: Backend API & Database
**Impact**: Enable multi-user support, persistence | **Timeline**: 1 week

#### Setup Backend Structure

```bash
mkdir backend
cd backend
npm init -y
npm install express cors helmet compression express-rate-limit
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install dotenv morgan
npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken ts-node-dev
```

**File**: `backend/package.json`

```json
{
  "name": "learner-portal-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.10.2",
    "prisma": "^6.1.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.7.3"
  }
}
```

**File**: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Database Schema

**File**: `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core course data
model Module {
  id                  String   @id @default(cuid())
  number              Int      @unique
  title               String
  subtitle            String
  level               String
  estimatedTime       String
  description         String
  learningObjectives  String[]
  lessons             Lesson[]
  quizzes             Quiz[]
  activities          Activity[]
  certifications      Certification[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([number])
}

model Lesson {
  id          String   @id @default(cuid())
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  order       Int
  title       String
  content     Json     // Store as JSON for flexibility
  keyInsight  String?
  video       Json?    // VideoLesson data
  progress    LessonProgress[]

  @@unique([moduleId, order])
  @@index([moduleId, order])
}

model Quiz {
  id          String   @id @default(cuid())
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title       String
  questions   Json     // Array of QuizQuestion
  type        String   // 'self-check' | 'certification'
  submissions QuizSubmission[]

  @@index([moduleId, type])
}

// User/Learner data
model Learner {
  id                    String   @id @default(cuid())
  email                 String   @unique
  password              String   // Hashed
  name                  String
  avatar                String?
  enrolledAt            DateTime @default(now())
  currentStreak         Int      @default(0)
  lastActivityAt        DateTime @default(now())

  progress              LessonProgress[]
  quizSubmissions       QuizSubmission[]
  certificates          Certificate[]

  @@index([email])
}

model LessonProgress {
  id              String   @id @default(cuid())
  learnerId       String
  learner         Learner  @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  lessonId        String
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  completed       Boolean  @default(false)
  completedAt     DateTime?
  timeSpent       Int?     // seconds

  @@unique([learnerId, lessonId])
  @@index([learnerId])
  @@index([lessonId])
}

model QuizSubmission {
  id              String   @id @default(cuid())
  learnerId       String
  learner         Learner  @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  quizId          String
  quiz            Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers         Json     // Record<questionId, answer>
  score           Int
  maxScore        Int
  passed          Boolean
  submittedAt     DateTime @default(now())

  @@index([learnerId, quizId])
  @@index([submittedAt])
}

model Certificate {
  id              String   @id @default(cuid())
  learnerId       String
  learner         Learner  @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  moduleId        String
  certificateId   String   @unique // Public-facing ID
  earnedAt        DateTime @default(now())
  verificationUrl String?

  @@unique([learnerId, moduleId])
  @@index([certificateId])
  @@index([learnerId])
}

model Activity {
  id              String   @id @default(cuid())
  moduleId        String
  module          Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title           String
  description     String
  content         Json
}

model Certification {
  id              String   @id @default(cuid())
  moduleId        String
  module          Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title           String
  requiredScore   Int
  content         Json
}
```

#### Express Server Setup

**File**: `backend/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import moduleRoutes from './routes/module.routes';
import learnerRoutes from './routes/learner.routes';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/learner', learnerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
```

#### Authentication Middleware

**File**: `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

**File**: `backend/src/middleware/rate-limit.middleware.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**File**: `backend/src/middleware/error.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

#### API Routes

**File**: `backend/src/routes/auth.routes.ts`

```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existing = await prisma.learner.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const learner = await prisma.learner.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: learner.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      learner: {
        id: learner.id,
        email: learner.email,
        name: learner.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const learner = await prisma.learner.findUnique({ where: { email } });
    if (!learner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, learner.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: learner.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      learner: {
        id: learner.id,
        email: learner.email,
        name: learner.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
```

**File**: `backend/src/routes/module.routes.ts`

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        lessons: {
          select: { id: true, title: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    });

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module
router.get('/:moduleId', async (req, res) => {
  try {
    const module = await prisma.module.findUnique({
      where: { id: req.params.moduleId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        quizzes: true,
        activities: true,
      },
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Get lesson
router.get('/:moduleId/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.lessonId },
      include: { module: true },
    });

    if (!lesson || lesson.moduleId !== req.params.moduleId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
```

**File**: `backend/src/routes/learner.routes.ts`

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Get learner progress
router.get('/progress', async (req: AuthRequest, res) => {
  try {
    const learner = await prisma.learner.findUnique({
      where: { id: req.userId },
      include: {
        progress: {
          include: { lesson: true },
          orderBy: { completedAt: 'desc' },
        },
        quizSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        certificates: true,
      },
    });

    res.setHeader('Cache-Control', 'private, max-age=60');
    res.json(learner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update lesson progress
router.post('/progress', async (req: AuthRequest, res) => {
  try {
    const { lessonId, completed } = req.body;

    const progress = await prisma.lessonProgress.upsert({
      where: {
        learnerId_lessonId: {
          learnerId: req.userId!,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        learnerId: req.userId!,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Update last activity
    await prisma.learner.update({
      where: { id: req.userId },
      data: { lastActivityAt: new Date() },
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit quiz
router.post('/quizzes', async (req: AuthRequest, res) => {
  try {
    const { quizId, answers } = req.body;

    // Get quiz questions
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    const questions = quiz.questions as any[];
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) {
        score++;
      }
    });

    const passed = score >= (questions.length * 0.7); // 70% passing

    const submission = await prisma.quizSubmission.create({
      data: {
        learnerId: req.userId!,
        quizId,
        answers,
        score,
        maxScore: questions.length,
        passed,
      },
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
```

#### Environment Variables

**File**: `backend/.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/learner_portal"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**File**: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
```

---

### PHASE 4: SSR/SSG Optimization (Fast Initial Load)
**Impact**: 40-60% faster initial page load | **Timeline**: 3-4 days

#### Convert Static Pages to SSG

**File**: `frontend/app/learn/page.tsx`

```typescript
// Remove 'use client' - make it a server component
import { Header } from '@/components/header';
import { ModuleCard } from '@/components/module-card';

// This will be generated at build time
export default async function LearnPage() {
  // Fetch at build time
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
    next: { revalidate: 86400 }, // ISR: revalidate every 24 hours
  });
  const modules = await res.json();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="IIAIC AI/ML Literacy Course"
        subtitle="Learn how AI is already transforming your world"
      />
      <main className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((module: any) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Enable ISR
export const revalidate = 86400; // 24 hours
```

**File**: `frontend/app/learn/[moduleId]/page.tsx`

```typescript
import { notFound } from 'next/navigation';

// Generate static params at build time
export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`);
  const modules = await res.json();

  return modules.map((module: any) => ({
    moduleId: module.id,
  }));
}

export default async function ModulePage({ params }: { params: { moduleId: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/${params.moduleId}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) notFound();

  const module = await res.json();

  return (
    <div>
      <h1>{module.title}</h1>
      {/* Static content */}
    </div>
  );
}

export const revalidate = 86400;
```

**File**: `frontend/app/learn/[moduleId]/[lessonId]/page.tsx`

```typescript
// Generate all lesson pages at build time
export async function generateStaticParams() {
  const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`);
  const modules = await modulesRes.json();

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
}

export default async function LessonPage({
  params
}: {
  params: { moduleId: string; lessonId: string }
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modules/${params.moduleId}/lessons/${params.lessonId}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) notFound();

  const lesson = await res.json();

  return (
    <div>
      {/* Lesson content */}
    </div>
  );
}

export const revalidate = 86400;
```

#### Code Splitting & Lazy Loading

**File**: `frontend/app/learn/[moduleId]/[lessonId]/page.tsx` (update)

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const QuizSection = dynamic(
  () => import('@/components/quiz-section').then(mod => ({ default: mod.QuizSection })),
  {
    loading: () => <QuizSkeleton />,
    ssr: false, // Client-only if needed
  }
);

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then(mod => ({ default: mod.VideoPlayer })),
  {
    loading: () => <div>Loading video...</div>,
    ssr: false,
  }
);
```

#### Image Optimization

**File**: `frontend/next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix: enable type checking
  },
  images: {
    unoptimized: false, // Fix: enable image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
```

---

### PHASE 5: Production Optimization & Monitoring
**Impact**: Production-ready performance | **Timeline**: 2-3 days

#### Add Error Boundaries

**File**: `frontend/app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full p-6 rounded-2xl bg-card border border-border text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          We're sorry, but something unexpected happened.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

#### Add Monitoring

```bash
cd frontend
pnpm add @vercel/speed-insights @sentry/nextjs
```

**File**: `frontend/app/layout.tsx` (update)

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**File**: `frontend/sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
});
```

---

### PHASE 6: Scalability Infrastructure (1000+ Concurrent Users)
**Impact**: Production-grade scalability | **Timeline**: 1 week

#### Database Connection Pooling

**File**: `backend/src/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

Use connection pooling service (PgBouncer, Prisma Accelerate, or Neon):

```env
# For Neon or Supabase (built-in pooling)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=25"

# Or use Prisma Accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

#### Add Redis Caching

```bash
cd backend
npm install ioredis
npm install -D @types/ioredis
```

**File**: `backend/src/cache.ts`

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache it
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

export const cache = {
  get: (key: string) => redis.get(key),
  set: (key: string, value: string, ttl?: number) =>
    ttl ? redis.setex(key, ttl, value) : redis.set(key, value),
  del: (key: string) => redis.del(key),
};

export default redis;
```

Update `backend/src/routes/module.routes.ts`:

```typescript
import { getCached } from '../cache';

router.get('/', async (req, res) => {
  const modules = await getCached(
    'modules:all',
    async () => {
      return await prisma.module.findMany({
        include: { lessons: true },
      });
    },
    3600 // 1 hour
  );

  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.json(modules);
});
```

#### Docker Setup for Deployment

**File**: `backend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["npm", "start"]
```

**File**: `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

**File**: `docker-compose.yml` (root)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: learner_portal
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/learner_portal"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "your-secret-key"
      FRONTEND_URL: "http://localhost:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:4000/api"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## Migration Strategy

### Week 1: Phase 1 (Frontend Fixes)
1. Move Sidebar to root layout
2. Add memoization to all components
3. Add loading states
4. Remove transition delays
5. **Deploy and measure**: Expect 70-90% improvement in navigation speed

### Week 2: Phase 2 (Data Layer)
1. Install TanStack Query
2. Create API client
3. Create data hooks
4. Add localStorage persistence
5. **Test**: Verify hooks work with mock data

### Week 3-4: Phase 3 (Backend)
1. Setup backend structure
2. Create database schema
3. Build API routes
4. Add authentication
5. **Migrate data**: Seed database with current course content
6. **Test**: Verify API endpoints

### Week 5: Phase 4 (SSR/SSG)
1. Convert static pages
2. Add generateStaticParams
3. Enable ISR
4. Add code splitting
5. **Deploy and measure**: Expect 40-60% faster initial load

### Week 6-7: Phase 5-6 (Production)
1. Add error boundaries
2. Setup monitoring
3. Add Redis caching
4. Configure connection pooling
5. Load testing
6. **Gradual rollout**: 10% → 50% → 100%

---

## Performance Targets

### Before (Current State)
- Navigation delay: **450-800ms**
- Initial load: **3-4s**
- Bundle size: **~250KB**
- Re-renders per click: **4-6**
- Concurrent user support: **~10-20**
- Lighthouse Score: **~70**

### After (All Phases)
- Navigation delay: **50-100ms** (85% faster ✅)
- Initial load: **1-1.5s** (60% faster ✅)
- Bundle size: **<150KB** (40% smaller ✅)
- Re-renders per click: **1** (83% reduction ✅)
- Concurrent user support: **1000+** (50x improvement ✅)
- Lighthouse Score: **95+** (36% improvement ✅)

**Key Metrics**:
- Time to Interactive: **<2s** (from ~4s)
- First Contentful Paint: **<1s** (from ~2s)
- Largest Contentful Paint: **<2.5s**

---

## Verification & Testing

### Performance Testing
```bash
# Frontend bundle analysis
cd frontend
ANALYZE=true pnpm build

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Load testing (backend)
cd backend
npm install -D k6
k6 run load-test.js
```

**File**: `backend/load-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function() {
  const res = http.get('http://localhost:4000/api/modules');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### End-to-End Testing
```bash
cd frontend
pnpm add -D @playwright/test
npx playwright install

# Run E2E tests
npx playwright test
```

**File**: `frontend/tests/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('sidebar navigation is fast', async ({ page }) => {
  await page.goto('/');

  const startTime = Date.now();
  await page.click('a[href="/learn"]');
  await page.waitForURL('/learn');
  const endTime = Date.now();

  const navigationTime = endTime - startTime;
  expect(navigationTime).toBeLessThan(200); // Under 200ms
});

test('sidebar state persists across navigation', async ({ page }) => {
  await page.goto('/');

  // Collapse sidebar
  await page.click('button[aria-label="Collapse sidebar"]');

  // Navigate
  await page.click('a[href="/learn"]');

  // Sidebar should still be collapsed
  const sidebar = page.locator('aside');
  await expect(sidebar).toHaveClass(/w-\[72px\]/);
});
```

---

## Critical Files Summary

**Files to modify (Phase 1)**:
1. `frontend/app/layout.tsx` - Move Sidebar to root (PRIMARY FIX)
2. `frontend/components/sidebar.tsx` - Add memoization
3. `frontend/hooks/use-mobile.ts` - Fix double state set
4. `frontend/components/quiz-section.tsx` - Memoize score
5. `frontend/components/lesson-content.tsx` - Memoize rendering
6. `frontend/components/video-player.tsx` - Memoize video ID
7. All page files - Remove individual `<Sidebar />` instances

**New files to create (Phases 2-6)**:
- `frontend/app/providers.tsx` - TanStack Query setup
- `frontend/lib/api-client.ts` - Axios instance
- `frontend/lib/hooks/*.ts` - Data fetching hooks
- `frontend/lib/storage.ts` - LocalStorage utilities
- `backend/` - Entire backend structure
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/**/*.ts` - Express API
- `docker-compose.yml` - Local development setup

---

## Cost Estimate (1000+ Concurrent Users)

**Cloud Infrastructure** (Vercel + Managed Services):
- Frontend (Vercel Pro): $20/mo
- Bandwidth (~10TB): $50-100/mo
- Database (Neon/Supabase Pro): $25-50/mo
- Redis (Upstash): $10-20/mo

**Total: ~$100-200/mo** for 1000+ concurrent users

**Alternative (Self-hosted)**:
- AWS/GCP compute: $50-150/mo
- RDS PostgreSQL: $50-100/mo
- ElastiCache Redis: $30-50/mo
- Load balancer: $20/mo

**Total: ~$150-320/mo** (more control, more setup)

---

This implementation plan transforms the application from a slow, hardcoded prototype into a production-ready platform that can handle 1000+ concurrent users with sub-100ms response times and fast initial loads for new visitors.
