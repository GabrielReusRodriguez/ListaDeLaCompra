import { User } from '../types';
import storage from './storage';

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const HASH_ALGORITHM = 'SHA-256';

export async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return btoa(String.fromCharCode(...hashArray));
}

export async function registerUser(username: string, password: string): Promise<User | null> {
  const existingUser = storage.getUser(username);
  if (existingUser) {
    return null;
  }

  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const createdAt = Date.now();

  const user: User = {
    username,
    salt,
    passwordHash,
    createdAt,
  };

  storage.saveUser(user);
  return user;
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const user = storage.getUser(username);
  if (!user) {
    return null;
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return null;
  }

  return user;
}

export function logout(): void {
  storage.clearSession();
}

export function getActiveUser(): string | null {
  return storage.getSession();
}

export function isAuthenticated(): boolean {
  return getActiveUser() !== null;
}

export default {
  registerUser,
  loginUser,
  logout,
  getActiveUser,
  isAuthenticated,
};
