import type { AppState, ImageEffectResult } from '~/domain/types';
import { miscUtil, imageImportUtil, imageUtil } from '~/domain/utils';

const LOCAL_STORAGE_KEY = 'partymoji-state';

interface SerializedAppState {
  baseImage: string | undefined;
  effects: {
    effectName: string;
    paramsValues: any[];
    state: { status: 'init' };
  }[];
  version: number;
  fname?: string | undefined;
  fps: number;
}

export const getStoredAppState = async (): Promise<AppState | undefined> => {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const savedState = JSON.parse(stored);
      if (Array.isArray(savedState.effects)) {
        const state = savedState as SerializedAppState;
        // Need to re-hydrate the baseImage's image data, as we don't save that to local storage
        let hydratedBaseImage: ImageEffectResult | undefined = undefined;
        let imageFps = 20;
        if (typeof state.baseImage === 'string') {
          if (state.baseImage.startsWith('data:image/gif')) {
            const blob = miscUtil.dataURItoBlob(state.baseImage);
            const f = new File([blob], state.fname!); // Can't have a baseImage without a filename
            const { image, fps } = await imageImportUtil.readImage(f);
            hydratedBaseImage = {
              gif: state.baseImage,
              gifWithBackgroundColor: state.baseImage,
              image,
              partiallyTransparent: false,
            };
            imageFps = fps;
          } else {
            // Non-gif
            const { image } = await imageImportUtil.readImage(
              savedState.baseImage
            );
            hydratedBaseImage = {
              gif: state.baseImage,
              gifWithBackgroundColor: state.baseImage,
              image,
              partiallyTransparent: imageUtil.isPartiallyTransparent(image),
            };
          }
        }
        return {
          ...state,
          baseImage: hydratedBaseImage,
          fps: imageFps,
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
  const toStore: SerializedAppState = {
    ...state,
    // Do not save the frame data -- it's big and can be re-hydrated on load.
    baseImage: state.baseImage?.gif,
    effects: state.effects.map((t): SerializedAppState['effects'][0] => ({
      ...t,
      // Remove the computed image for the state before storing.
      // Like the base image frame data, it can be recreated when the app first loads.
      state: { status: 'init' },
    })),
  };
  return JSON.stringify(toStore);
};
