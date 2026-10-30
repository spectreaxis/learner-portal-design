import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExchangeRate } from './exchangeRates';

// Rates are cached per currency pair for the whole file, so each test uses its own pair
const day = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);

async function withFetch(handler: (url: string) => Response | Promise<Response>, run: (requested: string[]) => Promise<void>) {
  const original = global.fetch;
  const requested: string[] = [];
  global.fetch = (async (url: string) => {
    requested.push(url);
    return handler(url);
  }) as typeof fetch;
  try {
    await run(requested);
  } finally {
    global.fetch = original;
  }
}

test('reads the rate from the CDN, using lowercase currency codes', async () => {
  await withFetch(
    () => new Response(JSON.stringify({ date: day(0), usd: { kes: 129.95 } })),
    async (requested) => {
      assert.equal(await getExchangeRate('USD', 'KES'), 129.95);
      assert.deepEqual(requested, ['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json']);
    }
  );
});

test('falls back to the Cloudflare mirror when the CDN fails', async () => {
  await withFetch(
    (url) =>
      url.includes('jsdelivr')
        ? new Response('unavailable', { status: 503 })
        : new Response(JSON.stringify({ date: day(0), eur: { kes: 140.5 } })),
    async (requested) => {
      assert.equal(await getExchangeRate('EUR', 'KES'), 140.5);
      assert.equal(requested[1], 'https://latest.currency-api.pages.dev/v1/currencies/eur.json');
    }
  );
});

test('refuses rates dated more than three days ago, so a stalled feed stops payments', async () => {
  await withFetch(
    () => new Response(JSON.stringify({ date: day(4), gbp: { kes: 170 } })),
    async () => {
      await assert.rejects(getExchangeRate('GBP', 'KES'), /temporarily unavailable/);
    }
  );
});

test('stops payments when neither source answers with a rate', async () => {
  await withFetch(
    () => new Response(JSON.stringify({ date: day(0), jpy: {} })),
    async (requested) => {
      await assert.rejects(getExchangeRate('JPY', 'KES'), /temporarily unavailable/);
      assert.equal(requested.length, 2);
    }
  );
});

test('keeps a current cached rate through an outage once it is due a refresh', async () => {
  await withFetch(
    () => new Response(JSON.stringify({ date: day(0), cad: { kes: 95 } })),
    async () => assert.equal(await getExchangeRate('CAD', 'KES'), 95)
  );

  const realNow = Date.now;
  Date.now = () => realNow() + 2 * 60 * 60 * 1000; // past the hourly refresh
  try {
    await withFetch(
      () => {
        throw new Error('network down');
      },
      async (requested) => {
        assert.equal(await getExchangeRate('CAD', 'KES'), 95);
        assert.equal(requested.length, 2);
      }
    );
  } finally {
    Date.now = realNow;
  }
});
