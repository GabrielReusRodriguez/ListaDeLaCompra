import { User, AppData } from '../types';

const USERS_KEY = 'ldlc:users';
const DATA_PREFIX = 'ldlc:data:';
const LANG_KEY = 'ldlc:lang';
const SESSION_KEY = 'ldlc:session';

export const storage = {
  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUser(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.username === user.username);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  },

  deleteUser(username: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.username !== username);
    this.saveUsers(filtered);
    // Also delete user data
    localStorage.removeItem(`${DATA_PREFIX}${username}`);
  },

  // App Data
  getAppData(username: string): AppData {
    const data = localStorage.getItem(`${DATA_PREFIX}${username}`);
    return data ? JSON.parse(data) : { lists: [], items: [] };
  },

  saveAppData(username: string, data: AppData): void {
    localStorage.setItem(`${DATA_PREFIX}${username}`, JSON.stringify(data));
  },

  // Language
  getLanguage(): string {
    return localStorage.getItem(LANG_KEY) || 'es';
  },

  setLanguage(lang: string): void {
    localStorage.setItem(LANG_KEY, lang);
  },

  // Session
  getSession(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
  },

  setSession(username: string): void {
    sessionStorage.setItem(SESSION_KEY, username);
  },

  clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },

  // Clear all
  clearAll(): void {
    localStorage.clear();
    sessionStorage.clear();
  },
};

export default storage;
