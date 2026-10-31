import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { generateKeyPairSync, verify } from 'crypto';
import { isValidSignature, securityCode, signCertificate, toCrockford } from './certificate-signing';

// Each test run signs with its own throwaway key (keys load on first use)
process.env.CERTIFICATE_SIGNING_KEY = generateKeyPairSync('ed25519')
  .privateKey.export({ format: 'der', type: 'pkcs8' })
  .toString('base64');

const fields = {
  certificateId: 'IIAIC-M1-ABCDEFGHJK',
  moduleNumber: 1,
  recipientName: 'Gavin Taji',
  earnedAt: new Date('2026-10-30T09:00:00.000Z'),
  revision: 1,
};

test('a signature verifies only for the exact fields it was made for', () => {
  const signature = signCertificate(fields);
  assert.ok(isValidSignature(fields, signature));

  assert.ok(!isValidSignature({ ...fields, recipientName: 'Gavin Tajj' }, signature));
  assert.ok(!isValidSignature({ ...fields, moduleNumber: 2 }, signature));
  assert.ok(!isValidSignature({ ...fields, earnedAt: new Date('2026-10-31T09:00:00Z') }, signature));
  assert.ok(!isValidSignature({ ...fields, revision: 2 }, signature));
});

test('the security code is stable, readable, and changes with each revision', () => {
  const code = securityCode(signCertificate(fields));
  assert.match(code, /^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.equal(securityCode(signCertificate(fields)), code);
  assert.notEqual(securityCode(signCertificate({ ...fields, revision: 2 })), code);
});

test('Crockford encoding packs five bits per character', () => {
  assert.equal(toCrockford(Buffer.from([0xff, 0xff]), 3), 'ZZZ');
  assert.equal(toCrockford(Buffer.from([0, 0]), 3), '000');
});

// Keys load once per process, so key configuration is tested in a fresh one
function runWithEnv(env: Record<string, string>, script: string) {
  return spawnSync(process.execPath, ['--require', 'ts-node/register/transpile-only', '-e', script], {
    cwd: __dirname,
    encoding: 'utf8',
    env: { PATH: process.env.PATH, ...env },
  });
}

test('signs with the configured key, in a format fixed for every issued certificate', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const { status, stdout, stderr } = runWithEnv(
    {
      NODE_ENV: 'production',
      CERTIFICATE_SIGNING_KEY: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64'),
    },
    `process.stdout.write(require('./certificate-signing').signCertificate({
      certificateId: 'IIAIC-M1-ABCDEFGHJK',
      moduleNumber: 1,
      recipientName: 'Gavin Taji',
      earnedAt: new Date('2026-10-30T09:00:00.000Z'),
      revision: 1,
    }))`
  );
  assert.equal(status, 0, stderr);

  // Changing this payload would invalidate every certificate already issued
  const payload = '["cogniwise-certificate/v1","IIAIC-M1-ABCDEFGHJK",1,"Gavin Taji","2026-10-30T09:00:00.000Z",1]';
  assert.ok(verify(null, Buffer.from(payload), publicKey, Buffer.from(stdout, 'base64')));
});

test('refuses to start without a signing key, in every environment', () => {
  for (const NODE_ENV of ['production', 'development']) {
    const { status, stderr } = runWithEnv({ NODE_ENV }, `require('./certificate-signing').assertSigningKey()`);
    assert.notEqual(status, 0);
    assert.match(stderr, /CERTIFICATE_SIGNING_KEY is not set/);
  }
});
