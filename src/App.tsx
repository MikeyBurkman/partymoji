import React from 'react';
import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';

import { Help } from '~/components/Help';
import { ImagePicker } from '~/components/ImagePicker';
import { ImageEffectList } from '~/components/ImageEffectList';
import { Icon } from '~/components/Icon';

import { computeGifsForState, getEffectsDiff } from '~/domain/computeGifs';
import type { AppState, AppStateEffect } from '~/domain/types';
import { miscUtil } from '~/domain/utils';
import { debugLog, IS_MOBILE, IS_DEV } from '~/domain/env';

import * as localStorage from '~/localStorage';
import { sliderParam } from '~/params/sliderParam';
import { POSSIBLE_EFFECTS } from '~/effects';
import { AlertProvider, AlertSnackbar, useSetAlert } from '~/AlertContext';
import { ProcessorQueueProvider } from '~/domain/useProcessingQueue';

// Number of millis to wait after a change before recomputing the gif
const COMPUTE_DEBOUNCE_MILLIS = 1000;

// Increase this by 1 when there's a breaking change to the app state.
// Don't change this unless we have to!
const CURRENT_APP_STATE_VERSION = 7;

const DEFAULT_FPS = 20;
const fpsParam = sliderParam({
  name: 'Final Gif Frames per Second',
  defaultValue: DEFAULT_FPS,
  min: 1,
  max: 60,
});

const DEFAULT_STATE: AppState = {
  version: CURRENT_APP_STATE_VERSION,
  effects: [],
  baseImage: undefined,
  fps: DEFAULT_FPS,
};

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

          if (effectsDiff.diff) {
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
    debugLog('UseEffect, doCompute', doCompute);
    if (!doCompute.compute) {
      return;
    }

    // TODO What happens if new changes come in while we're already computing?
    // Need to throw away previous results and calculate new ones.
    setDoCompute({ compute: false });
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
            <Section>
              <Help />
            </Section>
            <Section>
              <Stack spacing={1} alignItems="center">
                <Typography variant="h5">Source Image</Typography>
                <ImagePicker
                  name="Upload a source image"
                  currentImage={state.baseImage}
                  onChange={(baseImage, fname, fps) => {
                    if (IS_MOBILE) {
                      const [width, height] = baseImage.image.dimensions;
                      if (width > 512 || height > 512) {
                        setAlert({
                          severity: 'error',
                          message:
                            'The image you chose is too large to work well on mobile.',
                        });

                        return;
                      }
                    }

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
                />
                {fpsParam.fn({
                  value: state.fps,
                  onChange: (fps) => {
                    setState(
                      (prevState) => ({
                        ...prevState,
                        fps,
                      }),
                      { compute: 'later' },
                    );
                  },
                })}
              </Stack>
            </Section>
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

// Icons at https://fonts.google.com/icons?selected=Material+Icons

export const App: React.FC = () => {
  return (
    <ProcessorQueueProvider>
      <AlertProvider>
        <Inner />
      </AlertProvider>
    </ProcessorQueueProvider>
  );
};
