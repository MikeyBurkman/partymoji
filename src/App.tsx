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
import { computeGifsForState, getStateDiff } from '~/domain/computeGifs';
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
import './App.css';

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
          frameCount={state.frameCount}
          onImageChange={(baseImage, fname, fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                baseImage,
                fname,
                fps,
                frameCount: baseImage.image.frames.length,
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
              { compute: 'later' },
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
  const computeTimerRef = React.useRef<null | NodeJS.Timeout>(null);
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
        console.log('STATE CHANGE', newState);

        if (IS_DEV) {
          // eslint-disable-next-line
          (window as any).STATE = newState;
        }

        if (compute !== 'no' && newState.baseImage != null) {
          // Compute the gif some time from now.
          // Other changes within this time should push the compute time back
          if (computeTimerRef.current) {
            clearTimeout(computeTimerRef.current);
            computeTimerRef.current = null;
          }

          const stateDiff = getStateDiff({
            prevState: oldState,
            currState: newState,
          });

          if (stateDiff.changed) {
            if (compute === 'now') {
              setDoCompute({ compute: true, startIndex: stateDiff.index });
            } else {
              // later
              setDoCompute({ compute: false });
              computeTimerRef.current = setTimeout(() => {
                computeTimerRef.current = null;
                setDoCompute({
                  compute: true,
                  startIndex: stateDiff.index,
                });
              }, COMPUTE_DEBOUNCE_MILLIS);
            }
          }
        }

        return newState;
      });
    },
    [],
  );

  React.useEffect(() => {
    logger.debug('UseEffect', { doCompute });
    if (!doCompute.compute) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    console.log('Do compute!', (window as any).STATE);

    // TODO What happens if new changes come in while we're already computing?
    // Need to throw away previous results and calculate new ones.
    setDoCompute({ compute: false });

    void (async () => {
      setState(
        (prevState) => {
          return {
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
          };
        },
        { compute: 'now' },
      );

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

      // TODO error handling
      await computeGifsForState({
        state: {
          ...state,
          baseImage: newBaseImage,
        },
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
  }, [doCompute, setState, state]);

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
                {state.effects.length > 0 && (
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
