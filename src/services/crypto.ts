import type { EncryptedPayload } from '../types';

/**
 * Utilidades de Web Crypto API: salt, hash PBKDF2, cifrado AES-GCM y UUID.
 * La contraseña nunca se guarda ni sale del navegador.
 */

export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_KEY_BITS = 256;
export const PBKDF2_HASH = 'SHA-256';
/** PBKDF2 deriva 512 bits: 256 para el hash de verificación y 256 para la clave AES-GCM. */
export const PBKDF2_DERIVED_BITS = 512;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

export interface DerivedCredentials {
  /** Hash de verificación (mitad baja de los 512 bits), en base64. */
  hash: string;
  /** Clave AES-GCM derivada de la contraseña (mitad alta de los 512 bits). */
  key: CryptoKey;
}

/**
 * Deriva en una sola pasada de PBKDF2 los 512 bits de los que salen el hash de
 * verificación y la clave de cifrado. Así el coste del login no se duplica y el
 * formato de `ldlc:users` sigue siendo compatible con los usuarios existentes.
 */
export async function deriveCredentials(
  password: string,
  salt: string,
): Promise<DerivedCredentials> {
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
    PBKDF2_DERIVED_BITS,
  );
  const derived = new Uint8Array(bits);
  const hashBytes = derived.slice(0, PBKDF2_KEY_BITS / 8);
  const keyBytes = derived.slice(PBKDF2_KEY_BITS / 8);

  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);

  return { hash: toBase64(hashBytes), key };
}

/** Hash PBKDF2 de 256 bits. Se mantiene para verificar registros antiguos. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const { hash } = await deriveCredentials(password, salt);
  return hash;
}

/** IV aleatorio de 96 bits: cada escritura usa uno nuevo, nunca se reutiliza. */
export function generateIv(): Uint8Array<ArrayBuffer> {
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv);
  return iv;
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedPayload> {
  const iv = generateIv();
  const plaintext = encoder.encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    v: 1,
    alg: 'AES-GCM',
    iv: toBase64(iv),
    ct: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptJson(key: CryptoKey, payload: EncryptedPayload): Promise<unknown> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ct),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as unknown;
}

/** Exporta la clave como JWK para poder guardarla en `sessionStorage`. */
export async function exportKey(key: CryptoKey): Promise<string> {
  return JSON.stringify(await crypto.subtle.exportKey('jwk', key));
}

export async function importKey(jwk: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', JSON.parse(jwk) as JsonWebKey, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
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
