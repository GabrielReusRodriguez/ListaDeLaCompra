/**
 * Utilidades de Web Crypto API: salt, hash PBKDF2 y UUID.
 * La contraseña nunca se guarda ni sale del navegador.
 */

export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_KEY_BITS = 256;
export const PBKDF2_HASH = 'SHA-256';
const SALT_BYTES = 16;

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * `crypto.subtle` solo existe en contextos seguros (HTTPS o localhost).
 * Si se abre la app por IP en HTTP no hay Web Crypto: fallamos con un mensaje claro.
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    Boolean(crypto.subtle) &&
    typeof crypto.randomUUID === 'function'
  );
}

export function generateSalt(): string {
  const bytes = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    PBKDF2_KEY_BITS,
  );
  return toBase64(new Uint8Array(bits));
}

/** Comparación en tiempo constante para no filtrar información por tiempos. */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function createId(): string {
  return crypto.randomUUID();
}
