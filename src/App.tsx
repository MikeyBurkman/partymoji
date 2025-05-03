import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import React from 'react';
import { Help } from '~/components/Help';
import { Icon } from '~/components/Icon';
import { ImageEffectList } from '~/components/ImageEffectList';
import { computeGifsForState, getEffectsDiff } from '~/domain/computeGifs';
import type { AppState, AppStateEffect } from '~/domain/types';
import { imageUtil, miscUtil } from '~/domain/utils';
import { POSSIBLE_EFFECTS } from '~/effects';
import * as localStorage from '~/localStorage';
import { SourceImage } from './components/SourceImage';
import { DEFAULT_FPS } from './config';
import {
  AlertProvider,
  AlertSnackbar,
  useSetAlert,
} from './context/AlertContext';
import { ProcessorQueueProvider } from './context/ProcessingQueue';
import { IS_DEV, logger } from './domain/utils';
import { IS_MOBILE } from './domain/utils/isMobile';

// Number of millis to wait after a change before recomputing the gif
const COMPUTE_DEBOUNCE_MILLIS = 1000;

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

// Contains the "help" and Image Source sections.
const Header: React.FC<{
  state: AppState;
  setState: (
    fn: (oldState: AppState) => AppState,
    {
      compute,
    }: {
      compute: 'no' | 'now' | 'later';
    },
  ) => void;
  setAlert: (alert: { severity: 'error' | 'warning'; message: string }) => void;
}> = ({ state, setState, setAlert }) => {
  return (
    <>
      <Section>
        <Help />
      </Section>
      <Section>
        <SourceImage
          baseImage={state.baseImage}
          fps={state.fps}
          onImageChange={(baseImage, fname, fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                baseImage,
                fname,
                fps,
              }),
              { compute: 'now' },
            );
          }}
          onFpsChange={(fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                fps,
              }),
              { compute: 'later' },
            );
          }}
          onFrameCountChange={(frameCount) => {
            logger.info('Frame count changed', { frameCount });
            setState(
              (prevState) => ({
                ...prevState,
                frameCount,
              }),
              { compute: 'now' },
            );
          }}
          setAlert={setAlert}
        />
      </Section>
    </>
  );
};

// The main body component of the whole app.
const Inner: React.FC = () => {
  const [state, setStateRaw] = React.useState(DEFAULT_STATE);
  const [doCompute, setDoCompute] = React.useState<
    { compute: true; startIndex: number } | { compute: false }
  >({ compute: false });
  const [computeTimer, setComputeTimer] = React.useState<null | NodeJS.Timeout>(
    null,
  );
  const setAlert = useSetAlert();

  React.useEffect(() => {
    if (IS_MOBILE) {
      setAlert({
        severity: 'warning',
        message:
          'This app is not well optimized for mobile. Your experience may not be great.',
      });
    }
  }, [setAlert]);

  React.useEffect(() => {
    void (async () => {
      // If we have local storage state on startup, then reload that
      const stored = await localStorage.getStoredAppState();
      if (stored) {
        if (stored.version === CURRENT_APP_STATE_VERSION) {
          setStateRaw(stored);
          setDoCompute({ compute: true, startIndex: 0 });
        } else {
          // TODO Might be nice to tell the user we erased their previous stuff
          localStorage.clearAppState();
        }
      }
    })();
  }, []);

  const setState = React.useCallback(
    (
      fn: (oldState: AppState) => AppState,
      { compute }: { compute: 'no' | 'now' | 'later' },
    ) => {
      setStateRaw((oldState) => {
        const newState = fn(oldState);
        localStorage.saveAppState(newState);

        if (IS_DEV) {
          // eslint-disable-next-line
          (window as any).STATE = newState;
        }

        if (compute !== 'no' && newState.baseImage != null) {
          // Compute the gif some time from now.
          // Other changes within this time should push the compute time back
          if (computeTimer) {
            clearTimeout(computeTimer);
            setComputeTimer(null);
          }

          const effectsDiff = getEffectsDiff({
            prevState: oldState,
            currState: newState,
          });

          if (newState.frameCount !== oldState.frameCount) {
            // redo everything if the frame count changes
            setDoCompute({ compute: true, startIndex: 0 });
          } else if (effectsDiff.diff) {
            if (compute === 'now') {
              setDoCompute({ compute: true, startIndex: effectsDiff.index });
            } else {
              setDoCompute({ compute: false });
              setComputeTimer(
                setTimeout(() => {
                  setComputeTimer(null);
                  setDoCompute({
                    compute: true,
                    startIndex: effectsDiff.index,
                  });
                }, COMPUTE_DEBOUNCE_MILLIS),
              );
            }
          }
        }

        return newState;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    logger.debug('UseEffect', { doCompute });
    if (!doCompute.compute) {
      return;
    }

    // TODO What happens if new changes come in while we're already computing?
    // Need to throw away previous results and calculate new ones.
    setDoCompute({ compute: false });

    if (state.baseImage) {
      // set frame count -- it's a NOOP if no changes are made
      state.baseImage.image = imageUtil.changeFrameCount(
        state.baseImage.image,
        state.frameCount,
      );
    }

    void (async () => {
      setState(
        (prevState) => ({
          ...prevState,
          effects: prevState.effects.map((t, i): AppStateEffect => {
            if (i < doCompute.startIndex) {
              return t;
            } else {
              return {
                ...t,
                state: { status: 'computing' },
              };
            }
          }),
        }),
        { compute: 'no' },
      );
      // TODO error handling
      await computeGifsForState({
        state,
        onCompute: (image, computeIdx) => {
          setState(
            (prevState) => ({
              ...prevState,
              effects: miscUtil.replaceIndex(
                prevState.effects,
                computeIdx,
                (t): AppStateEffect => ({
                  ...t,
                  state: { status: 'done', image },
                }),
              ),
            }),
            { compute: 'no' },
          );
        },
        startEffectIndex: doCompute.startIndex,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doCompute]);

  return (
    <>
      <ScopedCssBaseline />
      <Container maxWidth={IS_MOBILE ? 'sm' : 'md'}>
        <Stack
          spacing={4}
          justifyContent="space-evenly"
          alignItems="center"
          width={IS_MOBILE ? 'sm' : undefined}
          divider={<Divider />}
        >
          <Typography variant="h2" pt={4}>
            Partymoji
          </Typography>
          <Stack spacing={4} divider={<Divider />}>
            <Header state={state} setState={setState} setAlert={setAlert} />
            {state.baseImage != null && (
              <>
                <Section>
                  <ImageEffectList
                    appState={state}
                    possibleEffects={POSSIBLE_EFFECTS}
                    onEffectsChange={(effects) => {
                      setState(
                        (prevState) => ({
                          ...prevState,
                          effects,
                        }),
                        { compute: 'now' },
                      );
                    }}
                  />
                </Section>
                {state.effects.length && (
                  <Section>
                    <Stack spacing={3}>
                      <Typography variant="h5">Clear Effects</Typography>
                      <Typography variant="body1">
                        <Icon name="Warning" color="warning" /> Clicking this
                        button will clear all effects for the image
                      </Typography>
                      <Button
                        startIcon={<Icon name="Clear" />}
                        sx={{ maxWidth: '300px' }}
                        variant="contained"
                        color="warning"
                        onClick={() => {
                          const newState: AppState = {
                            ...DEFAULT_STATE,
                            baseImage: state.baseImage,
                          };
                          setStateRaw(newState);
                          localStorage.saveAppState(newState);
                        }}
                      >
                        Clear Effects
                      </Button>
                    </Stack>
                  </Section>
                )}
              </>
            )}
            <a
              href="https://github.com/MikeyBurkman/partymoji"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                width={64}
                height={64}
                alt="Github Link"
              ></img>
            </a>
          </Stack>
        </Stack>
      </Container>

      <Stack pt={8}>
        <AlertSnackbar />
      </Stack>
    </>
  );
};

const Section: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Paper style={{ padding: 16, maxWidth: IS_MOBILE ? '300px' : undefined }}>
    {children}
  </Paper>
);

export const App: React.FC = () => {
  return (
    <ProcessorQueueProvider>
      <AlertProvider>
        <Inner />
      </AlertProvider>
    </ProcessorQueueProvider>
  );
};
