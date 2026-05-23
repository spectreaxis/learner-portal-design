'use client';

import { Bell, Search, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
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
        
        {/* User Avatar */}
        <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
}
