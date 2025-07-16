import React from 'react';
import { imageUtil, logger } from '~/domain/utils';
import { useProcessingQueue } from '~/components/useProcessingQueue';
import { DEFAULT_FPS } from '~/config';
import { computeGifsForState, getStateDiff } from '~/domain/computeGifs';
import { AppState } from '~/domain/types';
import { IS_DEV } from '~/domain/utils';
import * as localStorage from '~/localStorage';

const DEBOUNCE_MILLIS = 1000;

// Increase this by 1 when there's a breaking change to the app state.
// Don't change this unless we have to!
const CURRENT_APP_STATE_VERSION = 8;

const DEFAULT_STATE: AppState = {
  version: CURRENT_APP_STATE_VERSION,
  effects: [],
  baseImage: undefined,
  fps: DEFAULT_FPS,
  frameCount: 1,
};

type UseAppStateRet = [
  state: AppState,
  setState: (
    newState: AppState,
    opts?: {
      doNotStore?: boolean;
    },
  ) => void,
];

/**
 * Makes sure that all calls to setState() will also update localStorage
 */
function useAppState(): UseAppStateRet {
  const [state, setState_internal] = React.useState<AppState>(DEFAULT_STATE);
  const setState = React.useCallback<UseAppStateRet[1]>(
    (newState, opts): void => {
      logger.debug('Updating internal app state', {
        newState,
      });
      setState_internal(newState);
      if (!(opts?.doNotStore ?? false)) {
        localStorage.saveAppState(newState);
      }
      if (IS_DEV) {
        // eslint-disable-next-line
        (window as any).STATE = newState;
      }
    },
    [],
  );

  return React.useMemo<UseAppStateRet>(
    () => [state, setState],
    [state, setState],
  );
}

export interface AppStateContextProps {
  state: AppState;
  setState: (
    cb: (prevState: AppState) => AppState,
    debounce?: 'debounce',
  ) => void;
  resetState: () => void;
}

export const AppStateContext = React.createContext<AppStateContextProps>({
  state: DEFAULT_STATE,
  setState: () => null,
  resetState: () => null,
});

export const AppStateProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [state, setState_internal] = useAppState();

  // Used to set a debounce timer for computing gifs
  const computeTimer = React.useRef<NodeJS.Timeout | null>(null);

  const compute = useProcessingQueue({
    processFn: ({ state }: { state: AppState }) => {
      // Handle frame count changes
      const newBaseImage = (() => {
        const baseImage = state.baseImage;
        if (!baseImage || baseImage.image.frames.length === state.frameCount) {
          logger.info('Base image frame count did not change', {
            frameCount: state.frameCount,
          });
          return baseImage;
        }

        return {
          ...baseImage,
          image: imageUtil.changeFrameCount(baseImage.image, state.frameCount),
        };
      })();

      return computeGifsForState({
        state: {
          ...state,
          baseImage: newBaseImage,
        },
        startEffectIndex: 0,
      });
    },
    onComplete: (computedState) => {
      logger.debug('Compute finished', { computedState });
      setState_internal(computedState);
    },
  });

  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    (async () => {
      const savedState = await localStorage.getStoredAppState();
      if (savedState != null) {
        if (savedState.version === CURRENT_APP_STATE_VERSION) {
          setState_internal(savedState, { doNotStore: true });
          compute({
            state: savedState,
          });
        } else {
          setState_internal(DEFAULT_STATE);
        }
      }
      // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    })().catch((err: Error) => {
      console.error(
        'Error loading state from local storage',
        err.stack ?? err.message,
      );
    });
  }, [setState_internal, compute]);

  const setState = React.useCallback<AppStateContextProps['setState']>(
    (cb, debounce) => {
      if (computeTimer.current != null) {
        clearTimeout(computeTimer.current);
        computeTimer.current = null;
      }

      logger.debug('Setting app state', {
        debounce,
      });

      const delay = debounce === 'debounce' ? DEBOUNCE_MILLIS : 0;
      const newTimeout = setTimeout(() => {
        const newState = cb(state);
        const stateDiff = getStateDiff({
          prevState: state,
          currState: newState,
        });

        logger.debug('Calculated state diff', {
          newState,
          stateDiff,
        });

        if (stateDiff.changed) {
          // Mark everything as computing
          setState_internal(
            {
              ...state,
              effects: state.effects.map((e) => ({
                ...e,
                state: { status: 'computing' },
              })),
            },
            {
              doNotStore: true,
            },
          );

          compute({
            state: newState,
          });
        } else {
          // If no changes, we don't need to compute anything
          logger.debug('No changes detected, skipping compute');
        }

        if (computeTimer.current === newTimeout) {
          // Reset the compute timer IF we haven't replaced it with something else
          computeTimer.current = null;
        }
      }, delay);

      computeTimer.current = newTimeout;
    },
    [compute, setState_internal, state],
  );

  const resetState = React.useCallback(() => {
    setState_internal(DEFAULT_STATE);
  }, [setState_internal]);

  const context = React.useMemo<AppStateContextProps>(
    () => ({
      state,
      setState,
      resetState,
    }),
    [state, setState, resetState],
  );

  return <AppStateContext value={context}>{children}</AppStateContext>;
};
