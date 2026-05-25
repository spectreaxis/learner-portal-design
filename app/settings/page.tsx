'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { useSession, signOut } from 'next-auth/react';
import { useLearnerProgress, useUpdateProfile, useChangePassword } from '@/lib/hooks/useLearner';
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Sun, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { data: learnerData, isLoading } = useLearnerProgress();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const openProfileModal = () => {
    setProfileName(session?.user?.name || '');
    setProfileEmail(session?.user?.email || '');
    setProfileError('');
    setProfileSuccess(false);
    setShowProfileModal(true);
  };

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
    setShowPasswordModal(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!profileName || !profileEmail) {
      setProfileError('Name and email are required');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name: profileName, email: profileEmail });
      await update({ ...session, user: { ...session?.user, name: profileName, email: profileEmail } });
      setProfileSuccess(true);
      setTimeout(() => setShowProfileModal(false), 1500);
    } catch (error: any) {
      setProfileError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Failed to change password');
    }
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
  const enrolledDate = learnerData?.enrolledAt ? new Date(learnerData.enrolledAt) : new Date();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', description: 'Update your name, email, and avatar', action: 'Edit', onClick: openProfileModal },
        { icon: Shield, label: 'Password & Security', description: 'Manage your password and 2FA settings', action: 'Manage', onClick: openPasswordModal },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Configure email and push notifications', action: 'Configure', isToggle: false },
        { icon: Palette, label: 'Appearance', description: 'Choose your preferred theme', action: 'light', isToggle: true },
      ],
    },
  ];

  return (
    <>
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{session?.user?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{session?.user?.email || ''}</p>
              <p className="text-xs text-muted-foreground mt-1">Member since {enrolledDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
            </div>
            <button onClick={openProfileModal} className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Edit Profile</button>
          </div>
        </div>

        {settingsSections.map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">{section.title}</h3>
            <div className="rounded-2xl bg-card border border-border shadow-sm divide-y divide-border overflow-hidden">
              {section.items.map((item) => (
                <div key={item.label} onClick={(item as any).onClick} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {(item as any).isToggle ? (
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-warning" />
                      <div className="w-11 h-6 rounded-full bg-primary/20 p-1"><div className="w-4 h-4 rounded-full bg-primary transition-transform" /></div>
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

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Learning Statistics</h3>
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

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Session</h3>
          <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left">
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

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              {profileError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{profileError}</p>
                </div>
              )}
              {profileSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <p className="text-sm text-success">Profile updated successfully!</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">Cancel</button>
                <button type="submit" disabled={updateProfile.isPending} className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updateProfile.isPending ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <p className="text-sm text-success">Password changed successfully!</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">Cancel</button>
                <button type="submit" disabled={changePassword.isPending} className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {changePassword.isPending ? <><Loader2 className="w-5 h-5 animate-spin" />Changing...</> : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
