'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Lock, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useModules } from '@/lib/hooks/useModules';
import { useLearnerProgress } from '@/lib/hooks/useLearner';

const words = (text: string) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

// Every word typed must start a word of the lesson's title, its module's title
// or "module N". cmdk's default fuzzy match also accepts scattered letters, so
// "ethics" would find "Evaluating a Model: The Confusion Matrix".
function matchWords(_value: string, search: string, keywords: string[] = []) {
  const lessonWords = words(keywords.join(' '));
  return words(search).every((typed) => lessonWords.some((word) => word.startsWith(typed))) ? 1 : 0;
}

const LessonSearchContext = createContext<{ setOpen: (open: boolean) => void }>({
  setOpen: () => {},
});

/**
 * Lesson search for signed-in pages, opened from the header's search box or
 * with Cmd/Ctrl+K anywhere (including lesson pages, which have no header)
 */
export function LessonSearchProvider({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled]);

  return (
    <LessonSearchContext.Provider value={{ setOpen }}>
      {children}
      <CommandDialog
        open={enabled && open}
        onOpenChange={setOpen}
        title="Search lessons"
        description="Find a lesson by its title or module"
        filter={matchWords}
      >
        {/* Mounted only while open, so pages don't load the course until it's searched */}
        {open && <LessonResults onSelect={() => setOpen(false)} />}
      </CommandDialog>
    </LessonSearchContext.Provider>
  );
}

function LessonResults({ onSelect }: { onSelect: () => void }) {
  const router = useRouter();
  const { data: modules, isLoading, isError } = useModules();
  const { data: learnerData } = useLearnerProgress();

  return (
    <>
      {/* The global :focus-visible outline would be clipped by the dialog edge; the
          field is the dialog's only input, so the caret already shows focus */}
      <CommandInput placeholder="Search lessons..." className="focus-visible:outline-none!" />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !modules ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load lessons. Close this and try again.
          </p>
        ) : (
          <>
            <CommandEmpty>No lessons found.</CommandEmpty>
            {modules.map((module) => {
              // Same rule as the module cards: Module 2+ needs the previous module's certificate
              const isLocked = module.number > 1 && !learnerData?.certificates?.some(
                (cert: any) => cert.module?.number === module.number - 1
              );
              return (
                <CommandGroup key={module.id} heading={`Module ${module.number}: ${module.title}`}>
                  {module.lessons.map((lesson, index) => (
                    <CommandItem
                      key={lesson.id}
                      // Searched by keywords only (see matchWords); the id just keeps values unique
                      value={lesson.id}
                      keywords={[lesson.title, module.title, `module ${module.number}`]}
                      disabled={isLocked}
                      onSelect={() => {
                        onSelect();
                        router.push(`/learn/${module.id}/${lesson.id}`);
                      }}
                    >
                      {isLocked ? <Lock /> : <BookOpen />}
                      <span className="truncate">
                        {index + 1}. {lesson.title}
                      </span>
                      {isLocked && <span className="ml-auto text-xs text-muted-foreground">Locked</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>
    </>
  );
}

/** The header's search box, which opens lesson search */
export function LessonSearchButton() {
  const { setOpen } = useContext(LessonSearchContext);
  const [isMac, setIsMac] = useState(false);

  // Read after mounting: the server can't know the platform, and a mismatch would break hydration
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-colors"
    >
      <Search className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground w-44 text-left">Search lessons...</span>
      <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-background rounded border border-border">
        {isMac ? <span className="text-xs">⌘</span> : 'Ctrl'}K
      </kbd>
    </button>
  );
}
