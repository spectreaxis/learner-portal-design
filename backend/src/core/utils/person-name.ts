/**
 * Rules for the name printed on a certificate. A learner may correct it, but
 * only towards the same person: fixing a typo, accents or capitalisation, or
 * adding or dropping a name. Anything else (a legal name change) needs support.
 */

const MAX_LENGTH = 70;
// Letters and combining marks, separated by spaces, apostrophes, hyphens or dots
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:[ '’.-]+\p{L}[\p{L}\p{M}]*)*\.?$/u;
// Typos fixed in one correction, after accents and capitalisation are ignored;
// scaled by length so short names cannot become different short names
const MAX_TYPO_EDITS = 2;
const LETTERS_PER_TYPO = 4;

export function normalizePersonName(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** Returns why the name is unacceptable, or null when it is fine */
export function personNameProblem(name: string): string | null {
  if (name.length < 2) return 'Enter your full name';
  if (name.length > MAX_LENGTH) return `Names are limited to ${MAX_LENGTH} characters`;
  if (!NAME_PATTERN.test(name)) {
    return 'Use letters only, with spaces, hyphens or apostrophes between names';
  }
  return null;
}

// Case, accents and punctuation never tell two people apart
function fold(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

// Typos allowed between two spellings: one per four letters, at most two
const allowedTypos = (a: string, b: string) =>
  Math.min(MAX_TYPO_EDITS, Math.floor(Math.max(a.length, b.length) / LETTERS_PER_TYPO));

const isNear = (a: string, b: string) => editDistance(a, b) <= allowedTypos(a, b);

// Every part of `small` appears in `large`, allowing a typo or two in each
const containsParts = (large: string[], small: string[]) => small.every((part) => large.some((other) => isNear(part, other)));

/** Whether `next` can only be a corrected spelling or fuller form of `previous` */
export function isMinorNameCorrection(previous: string, next: string): boolean {
  const a = fold(previous);
  const b = fold(next);
  // Covers typos that join or split names too, e.g. "Mary Ann" and "Maryann"
  if (isNear(a, b)) return true;

  // Names added, dropped or reordered, as long as one keeps every part of the other
  const partsA = a.split(' ');
  const partsB = b.split(' ');
  return containsParts(partsA, partsB) || containsParts(partsB, partsA);
}
