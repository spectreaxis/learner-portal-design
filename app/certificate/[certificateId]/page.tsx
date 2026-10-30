'use client';

import React from 'react';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { useCertificatePayment, useCertificateCheckout, formatPrice } from '@/lib/hooks/usePayment';
import { Award, Download, GraduationCap, Shield, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from '@/components/CertificatePDF';
import { PaymentModal } from '@/components/PaymentModal';
import { ShareCertificateButton } from '@/components/share-certificate-button';
import { LoadError } from '@/components/load-error';
import { failedLoad } from '@/lib/failed-load';

export default function CertificateDetailPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = React.use(params);
  const { data: session } = useSession();
  const modulesQuery = useModules();
  const learnerQuery = useLearnerProgress();
  const { data: modules = [], isLoading: modulesLoading } = modulesQuery;
  const { data: learnerData, isLoading: learnerLoading } = learnerQuery;

  // Find the certificate early (before any conditional returns)
  const certificate = learnerData?.certificates?.find(
    (cert: any) => cert.certificateId === certificateId
  );

  // Find the module
  const module = certificate ? modules.find((m) => m.id === certificate.moduleId) : null;

  // Check payment status (ALL HOOKS must be called before any conditional returns)
  const paymentQuery = useCertificatePayment(certificate?.id || '');
  const { data: paymentData, isLoading: paymentLoading } = paymentQuery;
  const checkout = useCertificateCheckout(certificate?.id || '');
  const isPaid = paymentData?.isPaid || false;
  const priceLabel = paymentData ? formatPrice(paymentData.price) : '';
  const isOpening = checkout.phase === 'opening';

  const isLoading = modulesLoading || learnerLoading || paymentLoading;
  // Without the learner's data a missing certificate can't be told from one
  // that didn't load, and without its payment status a paid one would show as locked
  const loadError = failedLoad(modulesQuery, learnerQuery, paymentQuery);

  if (loadError) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Link
          href="/certificate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
        <LoadError {...loadError} />
      </div>
    );
  }

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

  // Now do conditional checks after all hooks
  if (!certificate) {
    notFound();
  }

  if (!module) {
    notFound();
  }

  const issueDate = new Date(certificate.earnedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const recipientName = session?.user?.name || learnerData?.name || 'Learner';

  // Until payment, the preview must not contain the real certificate details:
  // a CSS blur alone can be removed or read straight from the page
  const preview = isPaid
    ? { recipientName, issueDate, certificateId: certificate.certificateId }
    : { recipientName: 'Your Name', issueDate: '— — —', certificateId: 'IIAIC-XX-XXXXXXXX' };
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${certificate.certificateId}`
    : `/verify/${certificate.certificateId}`;

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
            {paymentLoading ? (
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </button>
            ) : isPaid ? (
              <>
                <PDFDownloadLink
                  document={
                    <CertificatePDF
                      recipientName={recipientName}
                      moduleNumber={module.number}
                      moduleTitle={module.title}
                      certificateId={certificate.certificateId}
                      issueDate={issueDate}
                      verifyUrl={verifyUrl}
                    />
                  }
                  fileName={`Cogniwise-Artificial-Intelligence-Literacy-Certificate-Module-${module.number}-${certificate.certificateId}.pdf`}
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
                <ShareCertificateButton
                  verifyUrl={verifyUrl}
                  title={`Cogniwise Artificial Intelligence Literacy certificate: Module ${module.number}`}
                />
              </>
            ) : (
              <button
                onClick={checkout.pay}
                disabled={isOpening}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
              >
                {isOpening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isOpening ? 'Opening secure checkout...' : `Pay ${priceLabel} to Download`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="relative rounded-2xl overflow-clip shadow-lg bg-white border-8 border-primary">
          {/* Payment Required Overlay: the certificate is taller than most screens, so the
              card sits at its top and stays in view while the page scrolls */}
          {!isPaid && (
            <div className="absolute inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 backdrop-blur-md">
              <div className="sticky top-10 text-center p-8 bg-white/90 rounded-2xl shadow-2xl max-w-md mx-4">
                <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Certificate Locked</h3>
                <p className="text-muted-foreground mb-6">
                  Complete payment of <strong>{priceLabel}</strong> to view and download your certificate
                </p>
                <button
                  onClick={checkout.pay}
                  disabled={isOpening}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-wait"
                >
                  {isOpening && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isOpening ? 'Opening secure checkout...' : 'Pay Now to Unlock'}
                </button>
                {paymentData && paymentData.price.currency !== paymentData.chargeCurrency && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Charged in {paymentData.chargeCurrency} at today&apos;s rate ·{' '}
                    <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">
                      Rates By Exchange Rate API
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Certificate Card */}
          <div className={`relative p-12 md:p-16 bg-white ${!isPaid ? 'select-none pointer-events-none' : ''}`}>
            {/* Inner border */}
            <div className="border-2 border-primary/30 p-10 relative">
              {/* Seal */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-gold bg-gold/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[8px] font-bold leading-tight text-gold-foreground px-1">
                    COGNIWISE<br />ARTIFICIAL<br />INTELLIGENCE<br />LITERACY
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                {/* Logo and Issuer */}
                <div className="mb-8">
                  <BrandMark className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                    COGNIWISE
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-6">ARTIFICIAL INTELLIGENCE LITERACY</p>
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
                  {preview.recipientName}
                </p>

                <p className="text-base text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  has successfully completed all lessons and assessments of{' '}
                  <strong>{module.title}</strong> in the Cogniwise Artificial Intelligence Literacy Basic AI/ML Course,
                  demonstrating comprehensive understanding and practical knowledge of the subject matter.
                </p>

                {/* Certificate Details */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-8 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Date of Issue
                    </p>
                    <p className="text-base font-semibold text-foreground">{preview.issueDate}</p>
                  </div>
                  <div className="hidden md:block h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Certificate ID
                    </p>
                    <p className="text-base font-semibold text-foreground font-mono">
                      {preview.certificateId}
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
                    Verified under the Cogniwise Artificial Intelligence Literacy Framework
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Verify at {isPaid ? verifyUrl : '—'} • This certificate demonstrates foundational AI/ML literacy
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
          {!paymentLoading && !isPaid && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Payment Required
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    To download this certificate as a PDF, please complete the payment of {priceLabel} with M-Pesa, card or another available method.
                    Your payment helps us maintain and improve the platform.
                  </p>
                </div>
              </div>
            </div>
          )}
          {!paymentLoading && isPaid && (
            <p className="text-xs text-muted-foreground">
              Click the "Download PDF" button above to download this certificate as a professional PDF file.
            </p>
          )}
        </div>
      </div>

      {/* Payment status after the Paystack checkout popup */}
      <PaymentModal
        phase={checkout.phase}
        error={checkout.error}
        onRetry={checkout.pay}
        onClose={checkout.reset}
      />
    </>
  );
}
