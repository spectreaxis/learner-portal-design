import { getExchangeRate } from '../../infrastructure/payments/exchangeRates';

// Learners always pay in KES; prices may be set in another currency (USD in
// production) and are converted at the day's rate when a payment starts
export const CHARGE_CURRENCY = 'KES';

export interface Price {
  amount: number;
  currency: string;
}

export interface ChargeQuote {
  amountMinor: number;
  currency: string;
  fxRate: number | null;
}

export const certificatePrice: Price = parsePrice(
  process.env.CERTIFICATE_PRICE ?? '5.00',
  process.env.CERTIFICATE_PRICE_CURRENCY ?? 'USD'
);

export async function quoteCharge(price: Price): Promise<ChargeQuote> {
  const fxRate = price.currency === CHARGE_CURRENCY ? null : await getExchangeRate(price.currency, CHARGE_CURRENCY);
  // M-Pesa only takes whole shillings, so round up rather than undercharge
  const shillings = Math.ceil(price.amount * (fxRate ?? 1) - 1e-9);
  return { amountMinor: shillings * 100, currency: CHARGE_CURRENCY, fxRate };
}

function parsePrice(amount: string, currency: string): Price {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0 || !/^[A-Z]{3}$/.test(currency)) {
    throw new Error('CERTIFICATE_PRICE must be a positive number and CERTIFICATE_PRICE_CURRENCY an ISO code like USD');
  }
  return { amount: value, currency };
}
