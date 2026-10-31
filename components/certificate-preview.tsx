'use client';

import { useEffect, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Loader2 } from 'lucide-react';
import { CertificatePDF, type CertificatePDFProps } from '@/components/CertificatePDF';

// A4 landscape
const ASPECT_RATIO = 841.89 / 595.28;
// Enough pixels for a sharp preview on large high-density screens
const MAX_RENDER_WIDTH = 3200;

/**
 * Builds the certificate PDF once per change of its contents. The preview
 * draws this file and the download saves it, so both are the same document.
 */
export function useCertificateFile(props: CertificatePDFProps) {
  const key = JSON.stringify(props);
  const [file, setFile] = useState<{ key: string; blob: Blob } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    pdf(<CertificatePDF {...(JSON.parse(key) as CertificatePDFProps)} />)
      .toBlob()
      .then((blob) => !cancelled && setFile({ key, blob }))
      .catch((error) => {
        console.error('Certificate PDF failed to build:', error);
        if (!cancelled) setFailedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    blob: file?.key === key ? file.blob : null,
    failed: failedKey === key,
  };
}

export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoked on the next tick, once the browser has started the download
  setTimeout(() => URL.revokeObjectURL(url));
}

interface CertificatePreviewProps {
  blob: Blob | null;
  failed: boolean;
  label: string;
}

/** Draws page 1 of the certificate PDF with pdf.js, at the screen's resolution */
export function CertificatePreview({ blob, failed, label }: CertificatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [drawn, setDrawn] = useState<Blob | null>(null);
  const [drawFailed, setDrawFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!blob || !canvas || !width) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      cleanup = () => task.destroy();
      const pdfDocument = await task.promise;
      const page = await pdfDocument.getPage(1);
      if (cancelled) return;

      const pixels = Math.min(width * window.devicePixelRatio, MAX_RENDER_WIDTH);
      const viewport = page.getViewport({ scale: pixels / page.getViewport({ scale: 1 }).width });
      // Draw offscreen first, so a resize never shows a blank or half-drawn page
      const buffer = document.createElement('canvas');
      buffer.width = Math.round(viewport.width);
      buffer.height = Math.round(viewport.height);
      await page.render({ canvas: buffer, viewport }).promise;
      if (cancelled) return;

      canvas.width = buffer.width;
      canvas.height = buffer.height;
      canvas.getContext('2d')!.drawImage(buffer, 0, 0);
      setDrawn(blob);
    })().catch((error) => {
      if (cancelled) return;
      console.error('Certificate preview failed to draw:', error);
      setDrawFailed(true);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [blob, width]);

  const ready = drawn !== null && drawn === blob;
  return (
    <div ref={containerRef} className="relative w-full bg-white" style={{ aspectRatio: ASPECT_RATIO }}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 w-full h-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          {failed || drawFailed ? (
            <p className="text-sm text-muted-foreground px-6 text-center">
              The preview couldn&apos;t be shown. Reload the page to try again.
            </p>
          ) : (
            <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Preparing certificate" />
          )}
        </div>
      )}
    </div>
  );
}
