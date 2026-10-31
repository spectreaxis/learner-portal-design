import { CheckCircle2, XCircle, ShieldAlert, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Certificate | Cogniwise Artificial Intelligence Literacy',
  // Records carry learners' names; they are for people holding a link, not search engines
  robots: { index: false, follow: false },
};

interface VerifiedCertificate {
  certificateId: string;
  earnedAt: string;
  recipientName: string;
  module: { title: string; number: number };
  revision: number;
  securityCode: string;
  signatureValid: boolean;
  nameCorrectedAt: string[];
}

async function getCertificate(certificateId: string): Promise<VerifiedCertificate | null> {
  try {
    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${API_URL}/learner/certificates/${encodeURIComponent(certificateId)}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return null;
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Public page: anyone with a certificate ID (e.g. an employer) can confirm it is genuine
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-card border border-border shadow-sm">
        {certificate?.signatureValid ? (
          <>
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-1">Certificate Verified</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Issued and digitally signed by Cogniwise Artificial Intelligence Literacy. This record has
                not been altered since it was signed.
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Awarded to</dt>
                <dd className="text-lg font-semibold text-foreground">{certificate.recipientName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Module</dt>
                <dd className="font-semibold text-foreground">
                  Module {certificate.module.number}: {certificate.module.title}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date of issue</dt>
                <dd className="font-semibold text-foreground">{formatDate(certificate.earnedAt)}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <dt className="text-muted-foreground">Certificate ID</dt>
                  <dd className="font-mono font-semibold text-foreground break-all">{certificate.certificateId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Security code</dt>
                  <dd className="font-mono font-semibold text-foreground">{certificate.securityCode}</dd>
                </div>
              </div>
              {certificate.nameCorrectedAt.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Name corrections</dt>
                  <dd className="text-foreground">
                    The holder corrected the name on {certificate.nameCorrectedAt.map(formatDate).join(' and ')}.
                    This is revision {certificate.revision}.
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 p-4 rounded-xl bg-muted text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Checking a copy?</p>
              The name, certificate ID and security code on it must match this record exactly. A different
              security code means the copy was altered or replaced by a later revision.
            </div>
          </>
        ) : certificate ? (
          // Signed fields changed without the signing key: never present this as genuine
          <div className="text-center">
            <ShieldAlert className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Certificate Could Not Be Verified</h1>
            <p className="text-sm text-muted-foreground">
              The record for <span className="font-mono break-all">{certificateId}</span> failed its integrity
              check, so this certificate should not be relied on. Please report it to{' '}
              <a href="mailto:hello@cogniwiseai.com" className="text-primary underline">
                hello@cogniwiseai.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="text-center">
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Certificate Not Found</h1>
            <p className="text-sm text-muted-foreground">
              No certificate matches the ID <span className="font-mono break-all">{certificateId}</span>.
            </p>
          </div>
        )}
        <p className="mt-8 text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Verified under the Cogniwise Artificial Intelligence Literacy Framework
        </p>
      </div>
    </div>
  );
}
