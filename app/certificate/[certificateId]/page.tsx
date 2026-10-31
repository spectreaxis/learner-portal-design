'use client';

import React, { useState } from 'react';
import { useLearnerProgress } from '@/lib/hooks/useLearner';
import { useModules } from '@/lib/hooks/useModules';
import { useCertificatePayment, useCertificateCheckout, formatPrice } from '@/lib/hooks/usePayment';
import { useLearnerCertificate } from '@/lib/hooks/useCertificate';
import { Download, Loader2, ArrowLeft, Lock, PenLine, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CertificatePreview, downloadFile, useCertificateFile } from '@/components/certificate-preview';
import { CertificateNameDialog } from '@/components/certificate-name-dialog';
import { PaymentModal } from '@/components/PaymentModal';
import { ShareCertificateButton } from '@/components/share-certificate-button';
import { CertificatePrice } from '@/components/certificate-price';
import { LoadError } from '@/components/load-error';
import { failedLoad } from '@/lib/failed-load';

export default function CertificateDetailPage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = React.use(params);
  const modulesQuery = useModules();
  const learnerQuery = useLearnerProgress();
  const { data: modules = [], isLoading: modulesLoading } = modulesQuery;
  const { data: learnerData, isLoading: learnerLoading } = learnerQuery;
  const [correcting, setCorrecting] = useState(false);

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
  const priceLabel = paymentData ? formatPrice(paymentData.price) : '';
  const isOpening = checkout.phase === 'opening';

  // The name, ID and security code printed on it; the first fetch after payment issues it
  const recordQuery = useLearnerCertificate(certificate ? certificateId : '', paymentData?.isPaid);
  const record = recordQuery.data;

  const issueDate = certificate
    ? new Date(certificate.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${certificateId}`
    : `/verify/${certificateId}`;

  // Until payment, the PDF is a specimen: no ID, security code or QR code
  const file = useCertificateFile({
    recipientName: record?.recipientName ?? '',
    moduleNumber: module?.number ?? 0,
    moduleTitle: module?.title ?? '',
    issueDate,
    issued: record?.isIssued
      ? { certificateId: record.certificateId, securityCode: record.securityCode, verifyUrl }
      : null,
  });

  const isLoading = modulesLoading || learnerLoading || paymentLoading || (!!certificate && recordQuery.isLoading);
  // Without the learner's data a missing certificate can't be told from one
  // that didn't load, and without its payment status a paid one would show as locked
  const loadError = failedLoad(modulesQuery, learnerQuery, paymentQuery, recordQuery);

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

  // Waiting on the payment status, which the record query is keyed on
  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading certificate" />
      </div>
    );
  }

  const fileName = `Cogniwise-Artificial-Intelligence-Literacy-Certificate-Module-${module.number}-${certificateId}.pdf`;
  const previewLabel = `${record.isIssued ? 'Certificate' : 'Specimen certificate'} of completion for Module ${module.number}, awarded to ${record.recipientName}`;

  return (
    <>
      <div className="p-6 max-w-5xl mx-auto">
        <Link
          href="/certificate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Certificate Details</h1>
          <div className="flex flex-wrap gap-3">
            {record.isIssued ? (
              <>
                <button
                  onClick={() => file.blob && downloadFile(file.blob, fileName)}
                  disabled={!file.blob}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
                >
                  {file.blob ? <Download className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  {file.blob ? 'Download PDF' : 'Preparing...'}
                </button>
                <ShareCertificateButton
                  verifyUrl={verifyUrl}
                  title={`Cogniwise Artificial Intelligence Literacy certificate: Module ${module.number}`}
                />
                <button
                  onClick={() => setCorrecting(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors shadow-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Correct name
                </button>
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

        {/* The preview is the PDF itself, drawn on screen */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <CertificatePreview blob={file.blob} failed={file.failed} label={previewLabel} />
        </div>

        {record.isIssued ? (
          <div className="mt-8 p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              Verifiable by anyone
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The QR code on your certificate opens its public record at{' '}
              <Link href={`/verify/${certificateId}`} className="text-primary underline break-all">
                {verifyUrl}
              </Link>
              . Whoever checks it will see the same name, certificate ID and security code as on the
              PDF, confirmed by the issuer&apos;s digital signature.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Issued to</dt>
                <dd className="font-semibold text-foreground">{record.recipientName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Security code</dt>
                <dd className="font-mono font-semibold text-foreground">{record.securityCode}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Name corrections left</dt>
                <dd className="font-semibold text-foreground">{record.nameCorrectionsLeft}</dd>
              </div>
            </dl>
            {record.revision > 1 && (
              <p className="mt-4 text-xs text-muted-foreground">
                This is revision {record.revision}. Copies downloaded before the last name correction no longer
                match the record, so share this version.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 p-6 rounded-2xl bg-card border border-border text-center">
            <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">This is a specimen</h3>
            {paymentData && (
              <div className="mb-4">
                <CertificatePrice price={paymentData.price} listPrice={paymentData.listPrice} />
              </div>
            )}
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-2">
              Pay once to issue your certificate with its ID, security code and verification QR code,
              and download it as a PDF.
            </p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
              It will be issued to <strong className="text-foreground">{record.recipientName}</strong>. If that
              isn&apos;t your full name as on your ID,{' '}
              <Link href="/settings" className="text-primary underline">
                change it in Settings
              </Link>{' '}
              first: after payment only small spelling corrections can be made.
            </p>
            <button
              onClick={checkout.pay}
              disabled={isOpening}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-8 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {isOpening && <Loader2 className="w-4 h-4 animate-spin" />}
              {isOpening ? 'Opening secure checkout...' : 'Pay Now to Unlock'}
            </button>
          </div>
        )}
      </div>

      {record.isIssued && (
        <CertificateNameDialog
          open={correcting}
          onOpenChange={setCorrecting}
          certificateId={certificateId}
          currentName={record.recipientName}
          correctionsLeft={record.nameCorrectionsLeft}
        />
      )}

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
