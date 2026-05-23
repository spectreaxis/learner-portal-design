'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from './sidebar';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  // Don't show sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Only show sidebar when authenticated and not on auth pages
  const showSidebar = status === 'authenticated' && !isAuthPage;

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}

      <main className={showSidebar ? 'flex-1 md:ml-[260px]' : 'flex-1'}>
        {children}
      </main>
    </div>
  );
}
