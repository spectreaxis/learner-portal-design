import { AppError } from '../../core/errors/AppError';

// Daily rates from the free fawazahmed0 currency API (no key, no rate limits,
// CC0 data): jsDelivr's CDN first, then the Cloudflare mirror its maintainer
// recommends for when the CDN fails
const SOURCES = [
  (from: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`,
  (from: string) => `https://latest.currency-api.pages.dev/v1/currencies/${from}.json`,
];
// The data changes once a day, so hourly is plenty
const REFRESH_MS = 60 * 60 * 1000;
// A rate dated earlier than this is no longer "today's" rate, so payments stop
// rather than use it. Checked against the data's own date: the API is run by a
// volunteer and could stop updating while still serving old rates.
const MAX_DATA_AGE_MS = 72 * 60 * 60 * 1000;

const cache = new Map<string, { rate: number; dataDate: number; refreshAt: number }>();

const isCurrent = (dataDate: number) => Date.now() - dataDate < MAX_DATA_AGE_MS;

async function fetchRate(url: string, from: string, to: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body: any = await response.json();
  const rate = body[from]?.[to];
  // "date" is the day the rates are for, e.g. "2026-10-30"
  const dataDate = Date.parse(`${body.date}T00:00:00Z`);
  if (typeof rate !== 'number' || rate <= 0 || Number.isNaN(dataDate)) {
    throw new Error('no rate in the response');
  }
  if (!isCurrent(dataDate)) throw new Error(`rates are from ${body.date}`);
  return { rate, dataDate };
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const key = `${from}:${to}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.refreshAt && isCurrent(cached.dataDate)) return cached.rate;

  const errors: string[] = [];
  for (const source of SOURCES) {
    const url = source(from.toLowerCase());
    try {
      const { rate, dataDate } = await fetchRate(url, from.toLowerCase(), to.toLowerCase());
      cache.set(key, { rate, dataDate, refreshAt: Date.now() + REFRESH_MS });
      return rate;
    } catch (error: any) {
      errors.push(`${new URL(url).host}: ${error.message}`);
    }
  }

  if (cached && isCurrent(cached.dataDate)) {
    console.warn(`Exchange rate refresh failed, using cached ${key}:`, errors.join('; '));
    return cached.rate;
  }
  console.error(`Exchange rate unavailable for ${key}:`, errors.join('; '));
  throw new AppError(503, 'Payments are temporarily unavailable, please try again shortly');
}
