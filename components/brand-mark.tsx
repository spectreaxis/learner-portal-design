import { cn } from '@/lib/utils';

// Cogniwise mark: three contour arcs opening east, with a waypoint dot at the gap.
// Same shape as app/icon.svg and the landing site's logo. The arcs are written as
// cubic Beziers rather than SVG "A" commands because @react-pdf/renderer (used by
// the certificate PDF) does not draw arc commands.
export const BRAND_ARCS = [
  'M32 12.6C28.7 7.29 22.28 4.82 16.27 6.54C10.26 8.26 6.12 13.75 6.12 20C6.12 26.25 10.26 31.74 16.27 33.46C22.28 35.18 28.7 32.71 32 27.4',
  'M27.4 15.4C25.34 12.04 21.3 10.46 17.51 11.53C13.72 12.6 11.1 16.06 11.1 20C11.1 23.94 13.72 27.4 17.51 28.47C21.3 29.54 25.34 27.96 27.4 24.6',
  'M22.6 18.2C21.79 16.79 20.12 16.1 18.55 16.52C16.98 16.94 15.88 18.37 15.88 20C15.88 21.63 16.98 23.06 18.55 23.48C20.12 23.9 21.79 23.21 22.6 21.8',
];
export const BRAND_DOT = { cx: 31.4, cy: 20, r: 3.4 };

interface BrandMarkProps {
  className?: string;
  /** Fill for the waypoint dot; arcs use currentColor. */
  dotColor?: string;
}

export function BrandMark({ className, dotColor = 'var(--foreground)' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        {BRAND_ARCS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle {...BRAND_DOT} fill={dotColor} />
    </svg>
  );
}
