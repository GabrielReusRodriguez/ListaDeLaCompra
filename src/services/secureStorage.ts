import { isEncryptedPayload, type UserData } from '../types';
import { decryptJson, encryptJson, importKey } from './crypto';
import * as storage from './storage';

/**
 * Lectura y escritura cifrada de los datos de cada usuario.
 *
 * - `localStorage` solo contiene el `EncryptedPayload` (AES-GCM-256).
 * - La clave AES se deriva de la contraseña en el login y vive en `sessionStorage`.
 * - Los datos creados antes del cifrado (JSON en claro) se migran al iniciar sesión.
 */

/** Cola por usuario para que dos escrituras seguidas no se pisen. */
const writeQueues = new Map<string, Promise<void>>();

function enqueue(username: string, task: () => Promise<void>): Promise<void> {
  const previous = writeQueues.get(username) ?? Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(
    username,
    next.catch(() => undefined),
  );
  return next;
}

export async function persistData(key: CryptoKey, username: string, data: UserData): Promise<void> {
  const payload = await encryptJson(key, data);
  await enqueue(username, async () => {
    storage.saveRawData(username, payload);
  });
}

export interface LoadedData {
  data: UserData;
  /** `true` si el contenido estaba en claro y se ha vuelto a guardar cifrado. */
  migrated: boolean;
}

/**
 * Descifra los datos del usuario. Si la clave no sirve (datos de otra cuenta o
 * contenido manipulado) devuelve datos vacíos en lugar de romper la app.
 */
export async function loadData(key: CryptoKey, username: string): Promise<LoadedData> {
  const raw = storage.getRawData(username);

  if (raw === null) {
    return { data: storage.normalizeData(null), migrated: false };
  }

  if (!isEncryptedPayload(raw)) {
    // Contenido anterior al cifrado: se acepta una sola vez y se re-cifra.
    const data = storage.normalizeData(raw);
    await persistData(key, username, data);
    return { data, migrated: true };
  }

  try {
    const plaintext = await decryptJson(key, raw);
    return { data: storage.normalizeData(plaintext), migrated: false };
  } catch {
    return { data: storage.normalizeData(null), migrated: false };
  }
}

/** Recupera la clave guardada en `sessionStorage` al recargar la página. */
export async function restoreKey(username: string): Promise<CryptoKey | null> {
  const jwk = storage.getSessionKey(username);
  if (!jwk) return null;
  try {
    return await importKey(jwk);
  } catch {
    storage.clearSessionKey(username);
    return null;
  }
}

/** Cifra los datos en claro de una cuenta antigua con la clave recién derivada. */
export async function migrateLegacyData(key: CryptoKey, username: string): Promise<void> {
  const raw = storage.getRawData(username);
  if (raw === null || isEncryptedPayload(raw)) return;
  await persistData(key, username, storage.normalizeData(raw));
}
