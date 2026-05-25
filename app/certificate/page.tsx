'use client';

import { Header } from '@/components/header';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { Award, Download, Share2, ExternalLink, Lock, CheckCircle2, GraduationCap, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CertificatePage() {
  const { data: session } = useSession();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: learnerData, isLoading: learnerLoading } = useLearnerProgress();

  const isLoading = modulesLoading || learnerLoading;

  // Get earned certificates
  const certificates = learnerData?.certificates || [];

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
                        href={`/learn/${module.id}/${lastLesson.id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Take Assessment
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
                        href={`/learn/${module.id}/${lastLesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Award className="w-4 h-4" />
                        Take Assessment
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

function OldCertificatePage_DELETE_THIS() {
  const { data: session } = useSession();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: learnerData, isLoading: learnerLoading } = useLearnerProgress();

  const isLoading = modulesLoading || learnerLoading;

  // Calculate real progress from API data
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedLessons = learnerData?.progress?.filter((p: any) => p.completed).length || 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isEligible = overallProgress >= 100;

  // Real certificate data from API
  const certificateData = {
    learnerName: learnerData?.name || session?.user?.name || 'Learner',
    courseName: 'Basic AI/ML Literacy',
    issueDate: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    certificateId: learnerData?.id ? 'IIAIC-AIML-2024-00' + learnerData.id.slice(-3) : 'IIAIC-AIML-2024-000',
    issuer: 'International Institute of AI Competence (IIAIC)',
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="Certificate"
          subtitle="IIAIC-verified certification"
        />
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading certificate...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Certificate"
        subtitle="IIAIC-verified certification"
      />
        
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Certificate Preview */}
          <div className="mb-8">
            <div className={cn(
              'relative rounded-2xl overflow-hidden shadow-lg',
              !isEligible && 'opacity-60'
            )}>
              {/* Certificate Card */}
              <div className="relative bg-card border border-border p-8 md:p-12">
                {/* Subtle pattern background */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Top Border Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

                {/* Content */}
                <div className="relative text-center">
                  {/* Logo and Issuer */}
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                        International Institute of
                      </p>
                      <p className="text-xl font-bold text-foreground">AI Competence</p>
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-3">
                    Certificate of Completion
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                    {certificateData.courseName}
                  </h1>

                  {/* Divider */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-24 bg-border" />
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-gold" />
                    </div>
                    <div className="h-px w-24 bg-border" />
                  </div>

                  {/* Awarded To */}
                  <p className="text-sm text-muted-foreground mb-2">
                    This is to certify that
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-3">
                    {certificateData.learnerName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto">
                    has successfully completed all modules and assessments of the IIAIC Basic AI/ML Literacy Course
                  </p>

                  {/* Modules Completed */}
                  <div className="flex justify-center gap-8 mb-10">
                    {modules.map((module) => {
                      const moduleLessons = module.lessons?.length || 0;
                      const completedInModule = learnerData?.progress?.filter(
                        (p: any) => p.lesson?.moduleId === module.id && p.completed
                      ).length || 0;
                      const moduleComplete = moduleLessons > 0 && completedInModule === moduleLessons;

                      return (
                        <div key={module.id} className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            moduleComplete ? "bg-success/10" : "bg-muted"
                          )}>
                            <CheckCircle2 className={cn(
                              "w-3.5 h-3.5",
                              moduleComplete ? "text-success" : "text-muted-foreground"
                            )} />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Module {module.number}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Certificate Details */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div>
                      <p className="font-semibold text-foreground">{certificateData.issueDate}</p>
                      <p className="text-xs">Date of Issue</p>
                    </div>
                    <div className="hidden md:block h-10 w-px bg-border" />
                    <div>
                      <p className="font-semibold text-foreground font-mono text-xs tracking-wider">
                        {certificateData.certificateId}
                      </p>
                      <p className="text-xs">Certificate ID</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-10 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      Verified under the IIAIC AI Competence Framework
                    </p>
                  </div>
                </div>
              </div>

              {/* Lock Overlay if not eligible */}
              {!isEligible && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
                      <Lock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Certificate Locked
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Complete all modules and pass the certification assessments to unlock your certificate.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm">
                      Progress: {overallProgress}% complete
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isEligible && (
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors shadow-sm">
                <Share2 className="w-5 h-5" />
                Share Certificate
              </button>
            </div>
          )}

          {/* Verification Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* About the Certificate */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">About This Certificate</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span>Issued by the International Institute of AI Competence (IIAIC)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span>Recognised under the IIAIC AI Competence Framework</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span>Demonstrates foundational AI/ML literacy</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span>Verifiable online via unique certificate ID</span>
                </li>
              </ul>
            </div>

            {/* Verification */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Certificate Verification</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Employers and institutions can verify this certificate using the unique certificate ID.
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Certificate ID</p>
                <p className="font-mono text-sm text-foreground mb-3 tracking-wider">
                  {certificateData.certificateId}
                </p>
                <a 
                  href="#"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify at iiaic.org/verify
                </a>
              </div>
            </div>
          </div>

          {/* Skills Covered */}
          <div className="mt-8">
            <h3 className="font-semibold text-foreground mb-4">Skills Demonstrated</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Understanding AI Fundamentals',
                'Machine Learning Concepts',
                'Data Literacy',
                'Model Evaluation',
                'AI Ethics & Bias Awareness',
                'Supervised Learning',
                'Unsupervised Learning',
                'Regression Analysis',
                'Critical AI Thinking'
              ].map((skill) => (
                <span 
                  key={skill}
                  className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
    </>
  );
}
