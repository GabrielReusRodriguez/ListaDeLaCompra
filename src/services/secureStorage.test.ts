import { describe, expect, it } from 'vitest';
import { decryptJson, deriveCredentials, encryptJson, exportKey } from './crypto';
import { loadData, migrateLegacyData, persistData, restoreKey } from './secureStorage';
import * as storage from './storage';
import { dataKey } from './storage';

const SALT = 'c2FsdA==';
const PASSWORD = 'secreto123';

async function keyFor(password = PASSWORD): Promise<CryptoKey> {
  return (await deriveCredentials(password, SALT)).key;
}

describe('almacenamiento cifrado', () => {
  it('persiste y vuelve a leer los datos', async () => {
    const key = await keyFor();
    await persistData(key, 'ana', {
      lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }],
      items: [],
    });

    const { data, migrated } = await loadData(key, 'ana');
    expect(migrated).toBe(false);
    expect(data.lists.map((list) => list.name)).toEqual(['Semana']);
  });

  it('no deja el texto plano en localStorage', async () => {
    const key = await keyFor();
    await persistData(key, 'ana', {
      lists: [{ id: 'l1', name: 'Secreto', createdAt: 1 }],
      items: [],
    });
    expect(localStorage.getItem(dataKey('ana'))).not.toContain('Secreto');
  });

  it('devuelve datos vacíos si no hay nada guardado', async () => {
    const key = await keyFor();
    expect(await loadData(key, 'nadie')).toEqual({
      data: { lists: [], items: [] },
      migrated: false,
    });
  });

  it('devuelve datos vacíos si la clave no corresponde', async () => {
    await persistData(await keyFor(), 'ana', {
      lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }],
      items: [],
    });
    const { data } = await loadData(await keyFor('otra-clave'), 'ana');
    expect(data).toEqual({ lists: [], items: [] });
  });

  it('migra datos en claro y los deja cifrados', async () => {
    storage.saveRawData('ana', { lists: [{ id: 'l1', name: 'Antigua', createdAt: 1 }], items: [] });
    const key = await keyFor();

    const { data, migrated } = await loadData(key, 'ana');
    expect(migrated).toBe(true);
    expect(data.lists[0].name).toBe('Antigua');

    const raw = storage.getRawData('ana');
    expect(raw).toMatchObject({ v: 1, alg: 'AES-GCM' });
    expect(JSON.stringify(raw)).not.toContain('Antigua');
  });

  it('migrateLegacyData no toca un payload ya cifrado', async () => {
    const key = await keyFor();
    const payload = await encryptJson(key, { lists: [], items: [] });
    storage.saveRawData('ana', payload);

    await migrateLegacyData(key, 'ana');
    expect(storage.getRawData('ana')).toEqual(payload);
  });

  it('serializa escrituras concurrentes sin perder el último estado', async () => {
    const key = await keyFor();
    await Promise.all([
      persistData(key, 'ana', { lists: [{ id: 'a', name: 'A', createdAt: 1 }], items: [] }),
      persistData(key, 'ana', { lists: [{ id: 'b', name: 'B', createdAt: 2 }], items: [] }),
      persistData(key, 'ana', { lists: [{ id: 'c', name: 'C', createdAt: 3 }], items: [] }),
    ]);

    const { data } = await loadData(key, 'ana');
    expect(data.lists.map((list) => list.id)).toEqual(['c']);
  });

  it('restoreKey recupera la clave guardada en sessionStorage', async () => {
    const key = await keyFor();
    storage.setSessionKey('ana', await exportKey(key));

    const restored = await restoreKey('ana');
    expect(restored).not.toBeNull();
    const payload = await encryptJson(key, { ok: true });
    expect(await decryptJson(restored as CryptoKey, payload)).toEqual({ ok: true });
  });

  it('restoreKey descarta una clave corrupta', async () => {
    storage.setSessionKey('ana', 'no-es-una-jwk');
    expect(await restoreKey('ana')).toBeNull();
    expect(storage.getSessionKey('ana')).toBeNull();
  });
});
