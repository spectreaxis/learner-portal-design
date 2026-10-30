import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { VerifiedPayment } from '../../core/interfaces/IPaymentProvider';
import type { Payment } from '../../infrastructure/database/repositories/PaymentRepository';

// pricing reads its config at import time
process.env.CERTIFICATE_PRICE = '10';
process.env.CERTIFICATE_PRICE_CURRENCY = 'KES';
const { PaymentService } = require('./PaymentService');

let payments: Payment[];
let verifyResult: VerifiedPayment;
let verifyCalls: number;
let checkouts: number;

const paymentRepo = {
  async create(data: any) {
    const payment = { id: `p${payments.length}`, status: 'PENDING', accessCode: null, createdAt: new Date(), ...data };
    payments.push(payment);
    return payment;
  },
  async update(id: string, data: any) {
    Object.assign(payments.find((p) => p.id === id)!, data);
  },
  async findByReference(reference: string) {
    return payments.find((p) => p.reference === reference) ?? null;
  },
  async findByCertificate(certificateId: string) {
    return payments.filter((p) => p.certificateId === certificateId).reverse();
  },
  async countSucceeded(certificateId: string) {
    return payments.filter((p) => p.certificateId === certificateId && p.status === 'SUCCEEDED').length;
  },
  async recordOutcome(reference: string, data: any) {
    const payment = payments.find((p) => p.reference === reference && p.status !== 'SUCCEEDED');
    if (payment) Object.assign(payment, data);
    return !!payment;
  },
};

const provider = {
  name: 'paystack',
  async createCheckout() {
    checkouts++;
    return { accessCode: `code${checkouts}` };
  },
  async verify() {
    verifyCalls++;
    return verifyResult;
  },
  parseWebhook(rawBody: Buffer) {
    return rawBody.toString();
  },
};

const service = new PaymentService(
  paymentRepo,
  { findById: async (id: string) => (id === 'cert1' ? { id, learnerId: 'learner1' } : null) },
  { findById: async (id: string) => ({ id, email: 'learner@example.com' }) },
  () => provider
);

beforeEach(() => {
  payments = [];
  verifyCalls = 0;
  checkouts = 0;
  verifyResult = { status: 'pending', amountMinor: 1000, currency: 'KES' };
});

test('sets the amount on the server in whole KES cents', async () => {
  const started = await service.startCertificatePayment('learner1', 'cert1');
  assert.equal(started.accessCode, 'code1');
  assert.equal(payments[0].amountMinor, 1000);
  assert.equal(payments[0].currency, 'KES');
});

test('resumes an unfinished checkout instead of starting a second payment', async () => {
  const first = await service.startCertificatePayment('learner1', 'cert1');
  const second = await service.startCertificatePayment('learner1', 'cert1');
  assert.equal(second.reference, first.reference);
  assert.equal(checkouts, 1);
});

test("refuses another learner's certificate", async () => {
  await assert.rejects(service.startCertificatePayment('intruder', 'cert1'), /Certificate not found/);
  const { reference } = await service.startCertificatePayment('learner1', 'cert1');
  await assert.rejects(service.getPaymentStatus('intruder', reference), /Payment not found/);
});

test('only verified success unlocks, and webhook retries are idempotent', async () => {
  const { reference } = await service.startCertificatePayment('learner1', 'cert1');
  assert.equal((await service.getCertificatePayment('learner1', 'cert1')).isPaid, false);

  verifyResult = { status: 'succeeded', amountMinor: 1000, currency: 'KES', channel: 'mobile_money' };
  verifyCalls = 0;
  await service.handleWebhook('paystack', Buffer.from(reference), {});
  await service.handleWebhook('paystack', Buffer.from(reference), {});

  assert.equal(payments[0].status, 'SUCCEEDED');
  assert.equal(payments[0].channel, 'mobile_money');
  // Once succeeded, nothing asks the provider again
  assert.equal(verifyCalls, 1);
  assert.equal((await service.getCertificatePayment('learner1', 'cert1')).isPaid, true);
  await assert.rejects(service.startCertificatePayment('learner1', 'cert1'), /already paid/);
});

test('rejects a success for less than the server-set amount or another currency', async () => {
  const { reference } = await service.startCertificatePayment('learner1', 'cert1');

  verifyResult = { status: 'succeeded', amountMinor: 100, currency: 'KES' };
  assert.equal((await service.getPaymentStatus('learner1', reference)).status, 'FAILED');

  verifyResult = { status: 'succeeded', amountMinor: 1000, currency: 'USD' };
  assert.equal((await service.getPaymentStatus('learner1', reference)).status, 'FAILED');
  assert.equal(payments[0].failureReason, 'amount_mismatch');
});

test('a late success upgrades a failed attempt, but nothing downgrades a success', async () => {
  const { reference } = await service.startCertificatePayment('learner1', 'cert1');

  verifyResult = { status: 'failed', amountMinor: 1000, currency: 'KES', failureReason: 'Declined' };
  assert.equal((await service.getPaymentStatus('learner1', reference)).status, 'FAILED');

  verifyResult = { status: 'succeeded', amountMinor: 1000, currency: 'KES' };
  assert.equal((await service.getPaymentStatus('learner1', reference)).status, 'SUCCEEDED');

  verifyResult = { status: 'failed', amountMinor: 1000, currency: 'KES' };
  await service.handleWebhook('paystack', Buffer.from(reference), {});
  assert.equal(payments[0].status, 'SUCCEEDED');
});

test('ignores webhooks for payments this app did not create', async () => {
  await service.handleWebhook('paystack', Buffer.from('someone_elses_reference'), {});
  assert.equal(verifyCalls, 0);
});

test('a provider outage keeps the last known state on reads', async () => {
  const { reference } = await service.startCertificatePayment('learner1', 'cert1');
  provider.verify = async () => {
    throw new Error('network down');
  };
  try {
    assert.equal((await service.getPaymentStatus('learner1', reference)).status, 'PENDING');
    await assert.rejects(service.handleWebhook('paystack', Buffer.from(reference), {}), /network down/);
  } finally {
    provider.verify = async () => {
      verifyCalls++;
      return verifyResult;
    };
  }
});
