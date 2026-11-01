import { describe, expect, it } from 'vitest';
import {
  constantTimeEqual,
  decryptJson,
  deriveCredentials,
  encryptJson,
  exportKey,
  generateIv,
  importKey,
} from './crypto';

const SALT = 'c2FsdA==';

describe('derivación de credenciales', () => {
  it('deriva el mismo hash y una clave compatible para la misma contraseña y salt', async () => {
    const a = await deriveCredentials('secreto123', SALT);
    const b = await deriveCredentials('secreto123', SALT);

    expect(a.hash).toBe(b.hash);
    expect(a.key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });

    const payload = await encryptJson(a.key, { hola: 'mundo' });
    expect(await decryptJson(b.key, payload)).toEqual({ hola: 'mundo' });
  });

  it('deriva credenciales distintas con otra contraseña o otro salt', async () => {
    const base = await deriveCredentials('secreto123', SALT);
    const otherPassword = await deriveCredentials('otra-cosa', SALT);
    const otherSalt = await deriveCredentials('secreto123', 'b3Rybw==');

    expect(otherPassword.hash).not.toBe(base.hash);
    expect(otherSalt.hash).not.toBe(base.hash);
  });

  it('el hash de verificación no es la clave de cifrado', async () => {
    const { hash, key } = await deriveCredentials('secreto123', SALT);
    const jwk = JSON.parse(await exportKey(key)) as JsonWebKey;
    expect(jwk.k).toBeTruthy();
    expect(jwk.k).not.toBe(hash);
  });
});

describe('cifrado AES-GCM', () => {
  it('cifra y descifra un objeto', async () => {
    const { key } = await deriveCredentials('secreto123', SALT);
    const payload = await encryptJson(key, { lists: [{ id: 'l1' }], items: [] });
    expect(payload).toMatchObject({ v: 1, alg: 'AES-GCM' });
    expect(await decryptJson(key, payload)).toEqual({ lists: [{ id: 'l1' }], items: [] });
  });

  it('usa un IV distinto en cada escritura', async () => {
    const { key } = await deriveCredentials('secreto123', SALT);
    const a = await encryptJson(key, { a: 1 });
    const b = await encryptJson(key, { a: 1 });
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it('rechaza descifrar con otra clave', async () => {
    const a = await deriveCredentials('secreto123', SALT);
    const b = await deriveCredentials('otra-cosa', SALT);
    const payload = await encryptJson(a.key, { a: 1 });
    await expect(decryptJson(b.key, payload)).rejects.toThrow();
  });

  it('rechaza un texto cifrado manipulado', async () => {
    const { key } = await deriveCredentials('secreto123', SALT);
    const payload = await encryptJson(key, { a: 1 });
    const tampered = { ...payload, ct: payload.ct.slice(0, -4) + 'AAAA' };
    await expect(decryptJson(key, tampered)).rejects.toThrow();
  });

  it('exporta e importa la clave para sobrevivir a una recarga', async () => {
    const { key } = await deriveCredentials('secreto123', SALT);
    const restored = await importKey(await exportKey(key));
    const payload = await encryptJson(key, { ok: true });
    expect(await decryptJson(restored, payload)).toEqual({ ok: true });
  });

  it('el IV tiene 12 bytes', () => {
    expect(generateIv()).toHaveLength(12);
  });

  it('constantTimeEqual compara sin filtrar longitud', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('abc', 'abd')).toBe(false);
    expect(constantTimeEqual('abc', 'ab')).toBe(false);
  });
});
