import { Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ModuleLockBannerProps {
  isLocked: boolean;
  reason?: string | null;
  previousModuleNumber?: number;
  previousModuleProgress?: number;
  hasPreviousCertificate?: boolean;
}

export function ModuleLockBanner({
  isLocked,
  reason,
  previousModuleNumber,
  previousModuleProgress = 0,
  hasPreviousCertificate = false,
}: ModuleLockBannerProps) {
  if (!isLocked) return null;

  return (
    <div className="mb-6 p-6 rounded-2xl bg-muted/50 border-2 border-dashed border-border">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Module Locked
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reason || 'Complete the previous module to unlock this content'}
          </p>

          {previousModuleNumber && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  previousModuleProgress >= 100 ? 'bg-success/10' : 'bg-muted'
                }`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${
                    previousModuleProgress >= 100 ? 'text-success' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={previousModuleProgress >= 100 ? 'text-success' : 'text-muted-foreground'}>
                  Complete all Module {previousModuleNumber} lessons ({previousModuleProgress}%)
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  hasPreviousCertificate ? 'bg-success/10' : 'bg-muted'
                }`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${
                    hasPreviousCertificate ? 'text-success' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={hasPreviousCertificate ? 'text-success' : 'text-muted-foreground'}>
                  Earn Module {previousModuleNumber} certificate (pass assessment)
                </span>
              </div>

              <Link
                href={`/learn/module-${previousModuleNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Continue Module {previousModuleNumber}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
