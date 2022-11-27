import { readImage } from './domain/run';
import { AppState, AppStateEffect } from './domain/types';

const LOCAL_STORAGE_KEY = 'partymoji-state';

export const getStoredAppState = async (): Promise<AppState | undefined> => {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const savedState = JSON.parse(stored);
      if (Array.isArray(savedState.effects)) {
        return {
          ...savedState,
          // Need to re-hydrate the baseImage's image data, as we don't save that to local storage
          baseImage:
            typeof savedState.baseImage === 'string'
              ? {
                  gif: savedState.baseImage,
                  image: await readImage(savedState.baseImage),
                }
              : undefined,
        };
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
  const toStore = {
    ...state,
    // Do not save the frame data -- it's big and can be re-hydrated on load.
    baseImage: state.baseImage?.gif,
    effects: state.effects.map(
      (t): AppStateEffect => ({
        ...t,
        // Remove the computed image for the state before storing.
        // Like the base image frame data, it can be recreated when the app first loads.
        state: { status: 'init' },
      })
    ),
  };
  return JSON.stringify(toStore);
};
