'use client';

import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { Award, Download, Share2, GraduationCap, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CertificateDetailPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = React.use(params);
  const { data: session } = useSession();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: learnerData, isLoading: learnerLoading } = useLearnerProgress();

  const isLoading = modulesLoading || learnerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  // Find the certificate
  const certificate = learnerData?.certificates?.find(
    (cert: any) => cert.certificateId === certificateId
  );

  if (!certificate) {
    notFound();
  }

  // Find the module
  const module = modules.find((m) => m.id === certificate.moduleId);

  if (!module) {
    notFound();
  }

  const issueDate = new Date(certificate.earnedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Navigation (hidden when printing) */}
      <div className="print:hidden p-6 max-w-5xl mx-auto">
        <Link
          href="/certificate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Certificate Details</h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors shadow-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Certificate (printable) */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-card border border-border">
          {/* Certificate Card */}
          <div className="relative p-12 md:p-16">
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
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

            {/* Content */}
            <div className="relative text-center">
              {/* Logo and Issuer */}
              <div className="flex items-center justify-center gap-3 mb-12">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                    International Institute of
                  </p>
                  <p className="text-2xl font-bold text-foreground">AI Competence</p>
                </div>
              </div>

              {/* Certificate Title */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-3">
                Certificate of Completion
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
                Module {module.number}
              </h1>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px w-32 bg-border" />
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <div className="h-px w-32 bg-border" />
              </div>

              {/* Awarded To */}
              <p className="text-sm text-muted-foreground mb-2">
                This is to certify that
              </p>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-3">
                {session?.user?.name || learnerData?.name || 'Learner'}
              </p>
              <p className="text-base text-muted-foreground mb-12 max-w-2xl mx-auto">
                has successfully completed all lessons and assessments of <strong>{module.title}</strong> in the IIAIC Basic AI/ML Literacy Course
              </p>

              {/* Certificate Details */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-10 text-sm text-muted-foreground mb-10">
                <div>
                  <p className="text-lg font-semibold text-foreground">{issueDate}</p>
                  <p className="text-xs">Date of Issue</p>
                </div>
                <div className="hidden md:block h-12 w-px bg-border" />
                <div>
                  <p className="text-lg font-semibold text-foreground font-mono tracking-wider">
                    {certificate.certificateId}
                  </p>
                  <p className="text-xs">Certificate ID</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verified under the IIAIC AI Competence Framework
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info section (hidden when printing) */}
        <div className="print:hidden mt-8 p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">About This Certificate</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This certificate verifies that the learner has successfully completed Module {module.number}: {module.title} with a passing score on the certification assessment.
          </p>
          <p className="text-xs text-muted-foreground">
            To download this certificate as PDF, click the "Download PDF" button above and use your browser&apos;s print function to save as PDF.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

import React from 'react';
