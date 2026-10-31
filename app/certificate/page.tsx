'use client';

import { Header } from '@/components/header';
import { LoadError } from '@/components/load-error';
import { failedLoad } from '@/lib/failed-load';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { Award, Download, Lock, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function findFirstIncompleteLesson(module: { lessons?: { id: string }[] }, learnerData: any) {
  const completedIds = new Set(
    learnerData?.progress?.filter((p: any) => p.completed).map((p: any) => p.lessonId) ?? []
  );
  return module.lessons?.find((l) => !completedIds.has(l.id));
}

export default function CertificatePage() {
  const modulesQuery = useModules();
  const learnerQuery = useLearnerProgress();
  const { data: modules = [], isLoading: modulesLoading } = modulesQuery;
  const { data: learnerData, isLoading: learnerLoading } = learnerQuery;

  const isLoading = modulesLoading || learnerLoading;
  const loadError = failedLoad(modulesQuery, learnerQuery);

  // Get earned certificates
  const certificates = learnerData?.certificates || [];

  if (loadError) {
    return (
      <>
        <Header
          title="Your Certificates"
          subtitle="Earned certifications"
        />
        <LoadError {...loadError} />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header
          title="Certificates"
          subtitle="Your earned certificates"
        />
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading certificates...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Your Certificates"
        subtitle="Earned certifications"
      />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {certificates.length === 0 ? (
          /* No certificates yet */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Certificates Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Complete modules and pass certification assessments to earn certificates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
              {modules.map((module) => {
                const moduleLessons = module.lessons?.length || 0;
                const completedInModule = learnerData?.progress?.filter(
                  (p: any) => p.lesson?.moduleId === module.id && p.completed
                ).length || 0;
                const moduleProgress = moduleLessons > 0
                  ? Math.round((completedInModule / moduleLessons) * 100)
                  : 0;
                const isReadyForAssessment = moduleProgress === 100;
                const lastLesson = module.lessons?.[module.lessons.length - 1];
                const nextLesson = findFirstIncompleteLesson(module, learnerData);

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "p-5 rounded-xl border text-left",
                      isReadyForAssessment
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border"
                    )}
                  >
                    <h4 className="font-semibold text-foreground mb-2">
                      Module {module.number}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {module.title}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {moduleProgress}% complete
                      </span>
                      {moduleProgress < 100 && (
                        <span className="text-xs text-muted-foreground">
                          🔒 Locked
                        </span>
                      )}
                      {isReadyForAssessment && (
                        <span className="text-xs text-primary font-medium">
                          ✓ Ready
                        </span>
                      )}
                    </div>
                    {isReadyForAssessment && lastLesson && (
                      <Link
                        href={`/learn/${module.id}/${lastLesson.id}?tab=certification`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Take Assessment
                      </Link>
                    )}
                    {moduleProgress > 0 && !isReadyForAssessment && nextLesson && (
                      <Link
                        href={`/learn/${module.id}/${nextLesson.id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                      >
                        Continue Module
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Show earned certificates */
          <div className="space-y-6">
            {modules.map((module) => {
              const certificate = certificates.find(
                (cert: any) => cert.moduleId === module.id
              );

              if (!certificate) {
                return null;
              }

              const issueDate = new Date(certificate.earnedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div
                  key={module.id}
                  className="p-6 rounded-2xl bg-card border-2 border-success/20 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Module {module.number} Certificate
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {module.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Earned: {issueDate}</span>
                          <span>•</span>
                          <span className="font-mono">{certificate.certificateId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/certificate/${certificate.certificateId}`}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Modules not yet complete */}
            {modules.filter((m) => !certificates.find((c: any) => c.moduleId === m.id)).map((module) => {
              const moduleLessons = module.lessons?.length || 0;
              const completedInModule = learnerData?.progress?.filter(
                (p: any) => p.lesson?.moduleId === module.id && p.completed
              ).length || 0;
              const moduleProgress = moduleLessons > 0
                ? Math.round((completedInModule / moduleLessons) * 100)
                : 0;
              const isReadyForAssessment = moduleProgress === 100;
              const lastLesson = module.lessons?.[module.lessons.length - 1];
              const nextLesson = findFirstIncompleteLesson(module, learnerData);

              return (
                <div
                  key={module.id}
                  className={cn(
                    "p-6 rounded-2xl bg-card border shadow-sm",
                    isReadyForAssessment
                      ? "border-primary/30 bg-primary/5"
                      : "border-border opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isReadyForAssessment ? "bg-primary/10" : "bg-muted"
                      )}>
                        {isReadyForAssessment ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Module {module.number} Certificate
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {module.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Progress: {moduleProgress}%
                          </span>
                          {moduleProgress < 100 && (
                            <span className="text-xs text-muted-foreground">
                              • Complete all lessons first
                            </span>
                          )}
                          {isReadyForAssessment && (
                            <span className="text-xs text-primary font-medium">
                              • Ready for assessment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isReadyForAssessment && lastLesson && (
                      <Link
                        href={`/learn/${module.id}/${lastLesson.id}?tab=certification`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Award className="w-4 h-4" />
                        Take Assessment
                      </Link>
                    )}
                    {moduleProgress > 0 && !isReadyForAssessment && nextLesson && (
                      <Link
                        href={`/learn/${module.id}/${nextLesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                      >
                        Continue Module
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
