import { createPrivateKey, createPublicKey, KeyObject, sign, verify } from 'crypto';

/**
 * Ed25519 signatures over the fields printed on a certificate. Anyone who can
 * write to the database but does not hold the key cannot change a name or date
 * without the verification page flagging the record.
 */

export interface SignedFields {
  certificateId: string;
  moduleNumber: number;
  recipientName: string;
  earnedAt: Date;
  revision: number;
}

// Crockford base32: no I, L, O or U, so codes read aloud or retyped stay unambiguous
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

let keys: { privateKey: KeyObject; publicKey: KeyObject } | undefined;

function loadKeys() {
  if (keys) return keys;

  // Required in every environment: a built-in fallback key would be public, and
  // a server misconfigured as development would sign forgeable certificates
  const encoded = process.env.CERTIFICATE_SIGNING_KEY;
  if (!encoded) {
    throw new Error(
      'CERTIFICATE_SIGNING_KEY is not set. Generate one with: openssl genpkey -algorithm ed25519 -outform DER | base64 -w0'
    );
  }
  const privateKey = createPrivateKey({ key: Buffer.from(encoded, 'base64'), format: 'der', type: 'pkcs8' });
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new Error('CERTIFICATE_SIGNING_KEY must be an Ed25519 private key');
  }

  keys = { privateKey, publicKey: createPublicKey(privateKey) };
  return keys;
}

// JSON of a fixed-order array, so no two different records share a payload
function payload(fields: SignedFields): Buffer {
  return Buffer.from(
    JSON.stringify([
      'cogniwise-certificate/v1',
      fields.certificateId,
      fields.moduleNumber,
      fields.recipientName,
      fields.earnedAt.toISOString(),
      fields.revision,
    ])
  );
}

export function signCertificate(fields: SignedFields): string {
  return sign(null, payload(fields), loadKeys().privateKey).toString('base64');
}

export function isValidSignature(fields: SignedFields, signature: string): boolean {
  return verify(null, payload(fields), loadKeys().publicKey, Buffer.from(signature, 'base64'));
}

// Fails at startup instead of at the first certificate when the key is missing or invalid
export function assertSigningKey() {
  loadKeys();
}

export function toCrockford(bytes: Buffer, length: number): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < length) {
      out += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  return out;
}

/**
 * Short code printed on the certificate and shown on the verification page.
 * It changes with every revision, so a copy printed before a name correction
 * no longer matches the record.
 */
export function securityCode(signature: string): string {
  const code = toCrockford(Buffer.from(signature, 'base64'), 12);
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
}
