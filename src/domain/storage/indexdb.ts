import { openDB } from 'idb';
import type { SerializedAppState } from '~/domain/types';

interface Storage {
  getStoredAppState: () => Promise<SerializedAppState | null>;
  saveAppState: (state: SerializedAppState) => Promise<void>;
  clearAppState: () => Promise<void>;
}

export const createIndexedDBStorage = async (): Promise<Storage> => {
  const db = await openDB('partymoji-db', 1, {
    upgrade(db) {
      db.createObjectStore('app-state');
    },
  });

  return {
    getStoredAppState: async () => {
      const state = (await db.get('app-state', 'state')) as
        | SerializedAppState
        | undefined;
      return state ?? null;
    },
    saveAppState: async (state) => {
      await db.put('app-state', state, 'state');
    },
    clearAppState: async () => {
      await db.delete('app-state', 'state');
    },
  };
};
