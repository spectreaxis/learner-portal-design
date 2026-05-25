'use client';

import React from 'react';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { Award, Download, Share2, GraduationCap, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from '@/components/CertificatePDF';

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

  const recipientName = session?.user?.name || learnerData?.name || 'Learner';

  return (
    <>
      {/* Navigation */}
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
            <PDFDownloadLink
              document={
                <CertificatePDF
                  recipientName={recipientName}
                  moduleNumber={module.number}
                  moduleTitle={module.title}
                  certificateId={certificate.certificateId}
                  issueDate={issueDate}
                />
              }
              fileName={`IIAIC-Certificate-Module-${module.number}-${certificate.certificateId}.pdf`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors shadow-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border-8 border-primary">
          {/* Certificate Card */}
          <div className="relative p-12 md:p-16 bg-white">
            {/* Inner border */}
            <div className="border-2 border-primary/30 p-10 relative">
              {/* Seal */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-gold bg-gold/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-bold text-gold-foreground">IIAIC</div>
                  <div className="text-[10px] text-gold-foreground">CERTIFIED</div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                {/* Logo and Issuer */}
                <div className="mb-8">
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                    INTERNATIONAL INSTITUTE OF
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-6">AI COMPETENCE</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.25em]">
                    Certificate of Completion
                  </p>
                </div>

                {/* Module Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                  Module {module.number}
                </h1>

                {/* Divider */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-px w-32 bg-border" />
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-gold" />
                  </div>
                  <div className="h-px w-32 bg-border" />
                </div>

                {/* Awarded To */}
                <p className="text-sm text-muted-foreground mb-3">
                  This is to certify that
                </p>
                <p className="text-4xl md:text-5xl font-bold text-primary mb-4">
                  {recipientName}
                </p>

                <p className="text-base text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  has successfully completed all lessons and assessments of{' '}
                  <strong>{module.title}</strong> in the IIAIC Basic AI/ML Literacy Course,
                  demonstrating comprehensive understanding and practical knowledge of the subject matter.
                </p>

                {/* Certificate Details */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-8 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Date of Issue
                    </p>
                    <p className="text-base font-semibold text-foreground">{issueDate}</p>
                  </div>
                  <div className="hidden md:block h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Certificate ID
                    </p>
                    <p className="text-base font-semibold text-foreground font-mono">
                      {certificate.certificateId}
                    </p>
                  </div>
                  <div className="hidden md:block h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Module
                    </p>
                    <p className="text-base font-semibold text-foreground">Module {module.number}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5" />
                    Verified under the IIAIC AI Competence Framework
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Verify at iiaic.org/verify • This certificate demonstrates foundational AI/ML literacy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="print:hidden mt-8 p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">About This Certificate</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This certificate verifies that the learner has successfully completed Module {module.number}: {module.title} with a passing score on the certification assessment.
          </p>
          <p className="text-xs text-muted-foreground">
            Click the "Download PDF" button above to download this certificate as a professional PDF file.
          </p>
        </div>
      </div>
    </>
  );
}
