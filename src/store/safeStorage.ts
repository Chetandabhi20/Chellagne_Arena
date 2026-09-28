import type { StateStorage } from 'zustand/middleware';

const memoryFallback = new Map<string, string>();

export const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(name);
        return item;
      }
    } catch (e) {
      // fallback
    }
    return memoryFallback.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
    } catch (e) {
      // fallback
    }
    memoryFallback.set(name, value);
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
        return;
      }
    } catch (e) {
      // fallback
    }
    memoryFallback.delete(name);
  },
};
