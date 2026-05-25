'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      'sticky top-0 z-30 flex items-center justify-between h-[72px] px-6 border-b border-border bg-background/80 backdrop-blur-md',
      className
    )}>
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          {title && <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-44"
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-background rounded border border-border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </button>

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
