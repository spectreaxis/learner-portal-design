'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCorrectCertificateName } from '@/lib/hooks/useCertificate';

interface CertificateNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: string;
  currentName: string;
  correctionsLeft: number;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all';

/**
 * Corrects the name on an issued certificate. The server only accepts small
 * corrections towards the same person and records each one; a different name
 * goes through support, who check identity before re-issuing.
 */
export function CertificateNameDialog({
  open,
  onOpenChange,
  certificateId,
  currentName,
  correctionsLeft,
}: CertificateNameDialogProps) {
  const correctName = useCorrectCertificateName(certificateId);
  const [name, setName] = useState(currentName);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const supportLink = `mailto:hello@cogniwiseai.com?subject=${encodeURIComponent(
    `Name change on certificate ${certificateId}`
  )}`;

  const changeOpen = (next: boolean) => {
    if (next) {
      setName(currentName);
      setReason('');
      setConfirmed(false);
      correctName.reset();
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await correctName.mutateAsync({ name, reason });
      onOpenChange(false);
    } catch {
      // Shown from correctName.error below
    }
  };

  const error = (correctName.error as any)?.response?.data?.error ?? (correctName.error ? 'Could not save the correction. Please try again.' : null);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Correct the name on this certificate</DialogTitle>
          <DialogDescription>
            For a spelling mistake, accents or capitalisation, or adding or removing part of your name.
            Each correction is recorded and shown on the certificate&apos;s verification page, and copies
            downloaded before it stop matching the record.
          </DialogDescription>
        </DialogHeader>

        {correctionsLeft > 0 ? (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="certificate-name" className="block text-sm font-medium text-foreground mb-2">
                Name on the certificate
              </label>
              <input
                id="certificate-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={70}
                autoComplete="name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="certificate-reason" className="block text-sm font-medium text-foreground mb-2">
                What needs correcting?
              </label>
              <textarea
                id="certificate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. My surname was missing"
                minLength={5}
                maxLength={300}
                rows={2}
                className={inputClass}
                required
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 accent-primary"
                required
              />
              This is my name as it appears on my official ID.
            </label>
            <p className="text-xs text-muted-foreground">
              {correctionsLeft === 1 ? '1 correction left' : `${correctionsLeft} corrections left`}. For a different
              name, such as after a legal name change,{' '}
              <a href={supportLink} className="text-primary underline">
                contact support
              </a>
              .
            </p>
            <DialogFooter>
              <button
                type="button"
                onClick={() => changeOpen(false)}
                className="px-4 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={correctName.isPending || !confirmed || name.trim() === currentName}
                className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {correctName.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save correction
              </button>
            </DialogFooter>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            This certificate has used all its name corrections.{' '}
            <a href={supportLink} className="text-primary underline">
              Contact support
            </a>{' '}
            with proof of identity to have it re-issued.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
