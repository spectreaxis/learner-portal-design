'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileSidebar } from './auth-layout';
import { LessonSearchButton } from './lesson-search';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { setOpen: setMobileSidebarOpen } = useMobileSidebar();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut({ callbackUrl: '/login' });
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    router.push('/settings');
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center justify-between gap-4 h-[72px] px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-md',
      className
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="min-w-0">
          {title && <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <LessonSearchButton />

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground leading-none">
                {session?.user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email?.split('@')[0] || 'Account'}
              </span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform hidden lg:block",
              showProfileMenu && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-lg overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-border">
                <p className="font-medium text-foreground">{session?.user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground truncate">{session?.user?.email || ''}</p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Settings</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
