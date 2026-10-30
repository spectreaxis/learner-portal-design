import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quoteCharge } from './pricing';

test('KES prices are charged as-is in whole shillings', async () => {
  assert.deepEqual(await quoteCharge({ amount: 10, currency: 'KES' }), {
    amountMinor: 1000,
    currency: 'KES',
    fxRate: null,
  });
});

test("USD prices convert at the day's rate and round up to a whole shilling", async () => {
  const original = global.fetch;
  global.fetch = (async () =>
    new Response(
      JSON.stringify({ result: 'success', rates: { KES: 129.23 }, time_next_update_unix: Date.now() / 1000 + 3600 })
    )) as typeof fetch;

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
