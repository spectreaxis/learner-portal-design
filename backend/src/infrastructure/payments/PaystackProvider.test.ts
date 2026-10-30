import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { PaystackProvider } from './PaystackProvider';

const secret = 'sk_test_example';
const provider = new PaystackProvider(secret);

function signed(event: object) {
  const body = Buffer.from(JSON.stringify(event));
  return { body, signature: createHmac('sha512', secret).update(body).digest('hex') };
}

test('accepts a correctly signed charge.success and returns its reference', () => {
  const { body, signature } = signed({ event: 'charge.success', data: { reference: 'cert_abc' } });
  assert.equal(provider.parseWebhook(body, { 'x-paystack-signature': signature }), 'cert_abc');
});

test('ignores signed events that need no action', () => {
  const { body, signature } = signed({ event: 'transfer.success', data: { reference: 'x' } });
  assert.equal(provider.parseWebhook(body, { 'x-paystack-signature': signature }), null);
});

test('rejects missing, wrong or tampered signatures', () => {
  const { body, signature } = signed({ event: 'charge.success', data: { reference: 'cert_abc' } });
  const tampered = Buffer.from(body.toString().replace('cert_abc', 'cert_xyz'));

  assert.throws(() => provider.parseWebhook(body, {}), /Invalid webhook signature/);
  assert.throws(() => provider.parseWebhook(body, { 'x-paystack-signature': 'abc' }), /Invalid webhook signature/);
  assert.throws(() => provider.parseWebhook(tampered, { 'x-paystack-signature': signature }), /Invalid webhook signature/);
});

test('maps Paystack statuses onto the payment lifecycle', async () => {
  const original = global.fetch;
  const respond = (data: object) =>
    (global.fetch = (async () => new Response(JSON.stringify({ status: true, data }))) as typeof fetch);

  try {
    respond({ status: 'success', amount: 1000, currency: 'KES', channel: 'mobile_money', id: 7, paid_at: '2026-10-30T10:00:00Z' });
    assert.deepEqual(await provider.verify('r'), {
      status: 'succeeded',
      amountMinor: 1000,
      currency: 'KES',
      channel: 'mobile_money',
      providerTxnId: '7',
      paidAt: new Date('2026-10-30T10:00:00Z'),
      failureReason: undefined,
    });

    for (const status of ['abandoned', 'ongoing', 'pending']) {
      respond({ status, amount: 1000, currency: 'KES' });
      assert.equal((await provider.verify('r')).status, 'pending');
    }

    respond({ status: 'failed', amount: 1000, currency: 'KES', gateway_response: 'Declined' });
    assert.deepEqual(
      [(await provider.verify('r')).status, (await provider.verify('r')).failureReason],
      ['failed', 'Declined']
    );
  } finally {
    global.fetch = original;
  }
});
