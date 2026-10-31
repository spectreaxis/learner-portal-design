import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'crypto';
import type { CertificateRecord } from '../../infrastructure/database/repositories/CertificateRepository';
import { CertificateService, newCertificateId } from './CertificateService';

// Each test run signs with its own throwaway key (keys load on first use)
process.env.CERTIFICATE_SIGNING_KEY = generateKeyPairSync('ed25519')
  .privateKey.export({ format: 'der', type: 'pkcs8' })
  .toString('base64');

let record: CertificateRecord;
let paid: boolean;
let auditLog: { previousName: string | null; newName: string; reason: string; revision: number }[];
// Simulates another correction committing between our read and our write
let concurrentCorrection: boolean;

const certificateRepo = {
  async findByCertificateId(certificateId: string) {
    return certificateId === record.certificateId
      ? { ...record, nameChanges: auditLog.map((c) => ({ revision: c.revision, createdAt: new Date() })) }
      : null;
  },
  async issue(_id: string, recipientName: string, signature: string) {
    Object.assign(record, { recipientName, signature });
  },
  async correctName(certificate: CertificateRecord, change: any) {
    if (concurrentCorrection || certificate.revision !== record.revision) {
      throw Object.assign(new Error('Record to update not found'), { code: 'P2025' });
    }
    record.revision += 1;
    Object.assign(record, { recipientName: change.newName, signature: change.signature });
    auditLog.push({ previousName: certificate.recipientName, newName: change.newName, reason: change.reason, revision: record.revision });
  },
};
const paymentRepo = { countSucceeded: async () => (paid ? 1 : 0) };

const service = new CertificateService(certificateRepo as any, paymentRepo as any);
const correct = (name: string, reason = 'My surname was missing') =>
  service.correctName('learner1', record.certificateId, { name, reason });

beforeEach(() => {
  record = {
    id: 'c1',
    learnerId: 'learner1',
    moduleId: 'm1',
    certificateId: 'IIAIC-M1-ABCDEFGHJK',
    earnedAt: new Date('2026-10-30T09:00:00Z'),
    recipientName: null,
    revision: 1,
    signature: null,
    learner: { name: '  Gavin  ' },
    module: { title: 'AI Is Already in Your Life', number: 1 },
    nameChanges: [],
  };
  paid = false;
  auditLog = [];
  concurrentCorrection = false;
});

test('certificate IDs are random and carry the module number', () => {
  const id = newCertificateId(3);
  assert.match(id, /^IIAIC-M3-[0-9A-HJKMNP-TV-Z]{10}$/);
  assert.notEqual(newCertificateId(3), id);
});

test('an unpaid certificate follows the profile name and cannot be verified', async () => {
  const view = await service.getForLearner('learner1', record.certificateId);
  assert.deepEqual(view, { certificateId: record.certificateId, isIssued: false, recipientName: '  Gavin  ' });
  assert.equal(record.signature, null);
  await assert.rejects(service.verifyCertificate(record.certificateId), /Certificate not found/);
});

test("paying issues the certificate, after which profile renames don't change it", async () => {
  paid = true;
  const view = await service.getForLearner('learner1', record.certificateId);
  assert.equal(view.isIssued, true);
  assert.equal(view.recipientName, 'Gavin');

  record.learner.name = 'Someone Else';
  const verified = await service.verifyCertificate(record.certificateId);
  assert.equal(verified.recipientName, 'Gavin');
  assert.equal(verified.signatureValid, true);
  assert.equal(verified.securityCode, view.isIssued && view.securityCode);
});

test('flags a record edited in the database without the signing key', async () => {
  paid = true;
  await service.getForLearner('learner1', record.certificateId);
  record.recipientName = 'Mary Wambui';
  assert.equal((await service.verifyCertificate(record.certificateId)).signatureValid, false);
});

test("hides other learners' certificates", async () => {
  paid = true;
  await assert.rejects(service.getForLearner('intruder', record.certificateId), /Certificate not found/);
  await assert.rejects(
    service.correctName('intruder', record.certificateId, { name: 'Gavin Taji', reason: 'Mine now' }),
    /Certificate not found/
  );
});

test('a correction re-signs the certificate, records it, and supersedes the old code', async () => {
  paid = true;
  const before = await service.getForLearner('learner1', record.certificateId);
  const after = await correct('Gavin Taji');

  assert.equal(after.recipientName, 'Gavin Taji');
  assert.equal(after.isIssued && after.revision, 2);
  assert.notEqual(after.isIssued && after.securityCode, before.isIssued && before.securityCode);
  assert.deepEqual(auditLog, [
    { previousName: 'Gavin', newName: 'Gavin Taji', reason: 'My surname was missing', revision: 2 },
  ]);

  const verified = await service.verifyCertificate(record.certificateId);
  assert.equal(verified.signatureValid, true);
  assert.equal(verified.nameCorrectedAt.length, 1);
});

test('refuses corrections to a different person, invalid names, and empty reasons', async () => {
  paid = true;
  await assert.rejects(correct('Mary Wambui'), /contact support with proof of identity/);
  await assert.rejects(correct('Gavin 2'), /Use letters only/);
  await assert.rejects(correct('Gavin Taji', ' '), /Explain the correction/);
  await assert.rejects(correct('Gavin'), /already the name/);
  assert.equal(auditLog.length, 0);
});

test('unpaid certificates are renamed in Settings, not corrected', async () => {
  await assert.rejects(correct('Gavin Taji'), /Change it in Settings/);
});

test('allows two corrections, then sends the learner to support', async () => {
  paid = true;
  await correct('Gavin Taji');
  await correct('Gavin Otieno Taji');
  await assert.rejects(correct('Gavin Otieno Tajii'), /used all its name corrections/);
  assert.equal(auditLog.length, 2);
});

test('a correction that loses a race asks the learner to reload', async () => {
  paid = true;
  await service.getForLearner('learner1', record.certificateId);
  concurrentCorrection = true;
  await assert.rejects(correct('Gavin Taji'), /Reload the page/);
  assert.equal(record.recipientName, 'Gavin');
});
