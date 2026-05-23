'use client';

import { Header } from '@/components/header';
import { useSession, signOut } from 'next-auth/react';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Sun, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: learnerData, isLoading } = useLearnerProgress();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const completedLessons = learnerData?.progress?.filter((p: any) => p.completed).length || 0;
  const currentStreak = learnerData?.currentStreak || 0;
  const totalCertificates = learnerData?.certificates?.length || 0;
  const passedQuizzes = learnerData?.quizSubmissions?.filter((q: any) => q.passed).length || 0;

  const enrolledDate = learnerData?.enrolledAt
    ? new Date(learnerData.enrolledAt)
    : new Date();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Update your name, email, and avatar',
          action: 'Edit',
        },
        {
          icon: Shield,
          label: 'Password & Security',
          description: 'Manage your password and 2FA settings',
          action: 'Manage',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Configure email and push notifications',
          action: 'Configure',
        },
        {
          icon: Palette,
          label: 'Appearance',
          description: 'Choose your preferred theme',
          action: 'light',
          isToggle: true,
        },
      ],
    },
  ];

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
      />

        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">{session?.user?.name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{session?.user?.email || ''}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {enrolledDate.toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <div key={section.title} className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {section.title}
              </h3>
              <div className="rounded-2xl bg-card border border-border shadow-sm divide-y divide-border overflow-hidden">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    </div>
                    {item.isToggle ? (
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-warning" />
                        <div className="w-11 h-6 rounded-full bg-primary/20 p-1">
                          <div className="w-4 h-4 rounded-full bg-primary transition-transform" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">{item.action}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Learning Stats */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Learning Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Lessons Done', value: completedLessons },
                { label: 'Day Streak', value: currentStreak },
                { label: 'Certificates', value: totalCertificates },
                { label: 'Quizzes Passed', value: passedQuizzes },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border shadow-sm text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Session
            </h3>
            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-destructive">Sign Out</p>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
    </>
  );
}
