import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseListPrice, quoteCharge } from './pricing';

test('KES prices are charged as-is in whole shillings', async () => {
  assert.deepEqual(await quoteCharge({ amount: 10, currency: 'KES' }), {
    amountMinor: 1000,
    currency: 'KES',
    fxRate: null,
  });
});

test("USD prices convert at the day's rate and round up to a whole shilling", async () => {
  const original = global.fetch;
  const today = new Date().toISOString().slice(0, 10);
  global.fetch = (async () => new Response(JSON.stringify({ date: today, usd: { kes: 129.23 } }))) as typeof fetch;

  try {
    assert.deepEqual(await quoteCharge({ amount: 5, currency: 'USD' }), {
      amountMinor: 64700,
      currency: 'KES',
      fxRate: 129.23,
    });
  } finally {
    global.fetch = original;
  }
});

test('the list price is optional, in the price currency, and must be above the price', () => {
  const price = { amount: 5, currency: 'USD' };
  assert.equal(parseListPrice(undefined, price), null);
  assert.equal(parseListPrice('', price), null);
  assert.deepEqual(parseListPrice('23.00', price), { amount: 23, currency: 'USD' });
  assert.throws(() => parseListPrice('5', price), /CERTIFICATE_LIST_PRICE/);
  assert.throws(() => parseListPrice('4', price), /CERTIFICATE_LIST_PRICE/);
  assert.throws(() => parseListPrice('abc', price), /CERTIFICATE_LIST_PRICE/);
});
