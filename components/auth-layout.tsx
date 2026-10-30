'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from './sidebar';
import { LessonSearchProvider } from './lesson-search';

// Lets the header's menu button open the sidebar on small screens
const MobileSidebarContext = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export const useMobileSidebar = () => useContext(MobileSidebarContext);

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close the mobile sidebar after navigating
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Don't show sidebar on auth or public verification pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/verify');

  // Only show sidebar when authenticated and not on auth pages
  const showSidebar = status === 'authenticated' && !isAuthPage;

  return (
    <MobileSidebarContext.Provider value={{ open: mobileSidebarOpen, setOpen: setMobileSidebarOpen }}>
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar />}

        <main className={showSidebar ? 'flex-1 min-w-0 md:ml-[260px]' : 'flex-1 min-w-0'}>
          {/* Always rendered so pages don't remount when the session finishes loading */}
          <LessonSearchProvider enabled={showSidebar}>{children}</LessonSearchProvider>
        </main>
      </div>
    </MobileSidebarContext.Provider>
  );
}
