import { CheckCircle2, XCircle, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Certificate — Cogniwise Artificial Intelligence Literacy',
};

interface VerifiedCertificate {
  certificateId: string;
  earnedAt: string;
  learnerName?: string;
  module?: { title: string; number: number };
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
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-sm text-center">
        {certificate ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Certificate Verified</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This certificate was issued by Cogniwise Artificial Intelligence Literacy.
            </p>
            <dl className="text-left space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Awarded to</dt>
                <dd className="font-semibold text-foreground">{certificate.learnerName}</dd>
              </div>
              {certificate.module && (
                <div>
                  <dt className="text-muted-foreground">Module</dt>
                  <dd className="font-semibold text-foreground">
                    Module {certificate.module.number}: {certificate.module.title}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Date of issue</dt>
                <dd className="font-semibold text-foreground">
                  {new Date(certificate.earnedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Certificate ID</dt>
                <dd className="font-mono font-semibold text-foreground break-all">{certificate.certificateId}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Certificate Not Found</h1>
            <p className="text-sm text-muted-foreground">
              No certificate matches the ID <span className="font-mono break-all">{certificateId}</span>.
            </p>
          </>
        )}
        <p className="mt-8 text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Verified under the Cogniwise Artificial Intelligence Literacy Framework
        </p>
      </div>
    </div>
  );
}
