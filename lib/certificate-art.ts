import QRCode from 'qrcode';

// Vector artwork for the certificate PDF, as SVG path data. Everything is drawn
// from geometry (no images), so it stays sharp at any print resolution.

const point = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`;

function polyline(points: [number, number][], close = false): string {
  return `M${points.map(([x, y]) => point(x, y)).join('L')}${close ? 'Z' : ''}`;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * Hypotrochoid rosette, the looping pattern of banknote guilloche. `fixed` and
 * `rolling` are the two gear sizes, `pen` the pen's offset on the rolling gear;
 * the curve is scaled to fit `radius`.
 */
export function rosettePath(
  cx: number,
  cy: number,
  radius: number,
  { fixed, rolling, pen }: { fixed: number; rolling: number; pen: number }
): string {
  const diff = fixed - rolling;
  const scale = radius / (Math.abs(diff) + pen);
  const turns = rolling / gcd(fixed, rolling);
  const steps = 360 * turns;
  const points: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * 2 * Math.PI * turns;
    points.push([
      cx + scale * (diff * Math.cos(t) + pen * Math.cos((diff / rolling) * t)),
      cy + scale * (diff * Math.sin(t) - pen * Math.sin((diff / rolling) * t)),
    ]);
  }
  return polyline(points, true);
}

/**
 * Braided sine waves along a straight band, phase-shifted so they interlace:
 * the woven border of a security document. Runs from (x, y) along the x axis
 * when horizontal, otherwise along the y axis.
 */
export function braidPaths(
  x: number,
  y: number,
  length: number,
  horizontal: boolean,
  { amplitude, wavelength, strands }: { amplitude: number; wavelength: number; strands: number }
): string[] {
  // A whole number of waves, so every strand meets the corner at the same height
  const waves = Math.max(1, Math.round(length / wavelength));
  const steps = waves * 24;
  return Array.from({ length: strands }, (_, strand) => {
    const phase = (strand / strands) * 2 * Math.PI;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const along = (i / steps) * length;
      const across = amplitude * Math.sin((i / steps) * waves * 2 * Math.PI + phase);
      points.push(horizontal ? [x + along, y + across] : [x + across, y + along]);
    }
    return polyline(points);
  });
}

/** Serrated edge of an embossed seal: a star with `points` alternating radii */
export function starburstPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const vertices: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * 2 * Math.PI - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    vertices.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return polyline(vertices, true);
}

/** QR code as one path in module units (with the standard 4-module quiet zone) */
export function qrCodePath(text: string): { path: string; size: number } {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const quiet = 4;
  let path = '';
  for (let row = 0; row < modules.size; row++) {
    // Each run of dark modules in a row becomes one rectangle
    let col = 0;
    while (col < modules.size) {
      if (!modules.get(row, col)) {
        col++;
        continue;
      }
      const start = col;
      while (col < modules.size && modules.get(row, col)) col++;
      path += `M${start + quiet} ${row + quiet}h${col - start}v1h${start - col}Z`;
    }
  }
  return { path, size: modules.size + quiet * 2 };
}
