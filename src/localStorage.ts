import { AppState } from './domain/types';

const LOCAL_STORAGE_KEY = 'partymoji-state';

export const getStoredAppState = (): AppState | undefined => {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const savedState = JSON.parse(stored);
      if (Array.isArray(savedState.transforms)) {
        return savedState;
      }
    }
  } catch (err) {
    // @ts-ignore
    console.error('Error loading state from local storage', err.stack || err);
  }

  return undefined;
};

export const saveAppState = (state: AppState) => {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, serializeAppState(state));
  } catch (err) {
    // @ts-ignore
    console.error('Error saving state to local storage', err.stack || err);
  }
};

export const clearAppState = () => {
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    // @ts-ignore
    console.error('Error clearing state from local storage', err.stack || err);
  }
};

const serializeAppState = (state: AppState): string => {
  const toStore: AppState = {
    ...state,
    transforms: state.transforms.map((t) => ({
      ...t,
      // Remove the computed image for the state before storing.
      // This just bloats the storage and doesn't keep anything that isn't reproduceable.
      computedImage: undefined,
    })),
  };
  return JSON.stringify(toStore);
};
