/**
 * Cryptographic utilities utilizing the standard Web Crypto API.
 * Ensures zero plaintext storage, salted one-way hashing, and timing-safe evaluation.
 */

export async function generateSalt(length = 16): Promise<string> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  // Using PBKDF2 via Web Crypto for strong key stretching and brute-force resistance
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = new Uint8Array(
    salt.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string comparison to mitigate side-channel timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
