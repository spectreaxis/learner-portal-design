import { AppError } from '../../core/errors/AppError';

// Free daily rates; the terms require the "Rates By Exchange Rate API" link the
// frontend shows next to converted prices
const RATES_URL = 'https://open.er-api.com/v6/latest';
const MIN_REFRESH_MS = 60 * 60 * 1000;
// A rate this old is no longer "today's" rate, so payments stop rather than use it
const MAX_STALE_MS = 48 * 60 * 60 * 1000;

const cache = new Map<string, { rate: number; fetchedAt: number; refreshAt: number }>();

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const key = `${from}:${to}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.refreshAt) return cached.rate;

  try {
    const response = await fetch(`${RATES_URL}/${from}`, { signal: AbortSignal.timeout(10_000) });
    const body: any = await response.json();
    const rate = body.rates?.[to];
    if (body.result !== 'success' || typeof rate !== 'number' || rate <= 0) {
      throw new Error(`no ${key} rate (HTTP ${response.status})`);
    }

    const now = Date.now();
    cache.set(key, {
      rate,
      fetchedAt: now,
      refreshAt: Math.max(body.time_next_update_unix * 1000, now + MIN_REFRESH_MS),
    });
    return rate;
  } catch (error: any) {
    if (cached && Date.now() - cached.fetchedAt < MAX_STALE_MS) {
      console.warn(`Exchange rate refresh failed, using cached ${key}:`, error.message);
      return cached.rate;
    }
    console.error(`Exchange rate unavailable for ${key}:`, error.message);
    throw new AppError(503, 'Payments are temporarily unavailable, please try again shortly');
  }
}
