import type { AppState } from '~/domain/types';
import { imageImportUtil, imageUtil } from '~/domain/utils';

const LOCAL_STORAGE_KEY = 'partymoji-state';

interface SerializedAppState extends Omit<AppState, 'baseImage'> {
  baseImage: string;
  fname?: string | undefined;
}

export const getStoredAppState = async (): Promise<AppState | null> => {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored == null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const savedState = JSON.parse(stored);
  if (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof savedState.baseImage === 'string'
  ) {
    const state = savedState as SerializedAppState;
    // Need to re-hydrate the baseImage's image data, as we don't save that to local storage
    const { image } = await imageImportUtil.readImage(state.baseImage);
    return {
      ...state,
      baseImage: {
        gif: state.baseImage,
        gifWithBackgroundColor: state.baseImage,
        image,
        partiallyTransparent: imageUtil.isPartiallyTransparent(image),
      },
    };
  } else {
    console.error('Invalid app state in local storage', savedState);
    return null;
  }
};

export const saveAppState = (state: AppState) => {
  try {
    const serializedState = serializeAppState(state);
    if (serializedState == null) {
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        'Error saving state to local storage',
        err.stack ?? err.message,
      );
    } else {
      console.error('Error saving state to local storage', err);
    }
  }
};

export const clearAppState = () => {
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        'Error clearing state from local storage',
        err.stack ?? err.message,
      );
    } else {
      console.error('Error clearing state from local storage', err);
    }
  }
};

const serializeAppState = (state: AppState): string | null => {
  if (state.baseImage == null) {
    return null;
  }

  const toStore: SerializedAppState = {
    ...state,
    // Do not save the frame data -- it's big and can be re-hydrated on load.
    baseImage: state.baseImage.gif,
    effects: state.effects.map((t): SerializedAppState['effects'][0] => ({
      ...t,
      // Remove the computed image for the state before storing.
      // Like the base image frame data, it can be recreated when the app first loads.
      state: { status: 'init' },
    })),
  };
  return JSON.stringify(toStore);
};
