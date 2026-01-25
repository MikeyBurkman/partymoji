import { AppState, SerializedAppState } from '../types';
import { createIndexedDBStorage } from './indexdb';
import { imageImportUtil, imageUtil } from '~/domain/utils';

const storagePromise = createIndexedDBStorage();

export async function getStoredAppState(): Promise<AppState | null> {
  const storage = await storagePromise;
  const serializedState = await storage.getStoredAppState();

  if (serializedState == null) {
    // Nothing saved
    return null;
  }

  // Need to hydrate the baseImage's image data, as we don't save that to storage
  const { image } = await imageImportUtil.readImage(serializedState.baseImage);
  return {
    ...serializedState,
    baseImage: {
      gif: serializedState.baseImage,
      gifWithBackgroundColor: serializedState.baseImage,
      image,
      partiallyTransparent: imageUtil.isPartiallyTransparent(image),
    },
  };
}

export async function saveAppState(state: AppState) {
  const storage = await storagePromise;
  const serializedState = serializeAppState(state);
  if (serializedState == null) {
    return;
  }
  return storage.saveAppState(serializedState);
}

export async function clearAppState() {
  const storage = await storagePromise;
  return storage.clearAppState();
}

function serializeAppState(state: AppState): SerializedAppState | null {
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

  return toStore;
}
