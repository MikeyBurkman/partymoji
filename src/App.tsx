import {
  Button,
  Container,
  Divider,
  Icon,
  Paper,
  Stack,
  Typography,
} from '@material-ui/core';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import React from 'react';

import { Help } from './components/Help';
import { ImagePicker } from './components/ImagePicker';
import { ImageEffectList } from './components/ImageEffectList';
import { ImportExport } from './components/ImportExport';
import { applyEffect, computeGifs, getEffectsDiff } from './domain/computeGifs';
import { AppState, AppStateEffect } from './domain/types';
import { replaceIndex } from './domain/utils';
import { ENV, debugLog } from './domain/env';
import * as localStorage from './localStorage';
import { sliderParam } from './params/sliderParam';
import { POSSIBLE_EFFECTS } from './effects';

// Number of millis to wait after a change before recomputing the gif
const COMPUTE_DEBOUNCE_MILLIS = 1000;

// Increase this by 1 when there's a breaking change to the app state.
// Don't change this unless we have to!
const CURRENT_APP_STATE_VERSION = 2;

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

export const App: React.FC = () => {
  const [state, setStateRaw] = React.useState(DEFAULT_STATE);
  const [doCompute, setDoCompute] = React.useState<
    { compute: true; startIndex: number } | { compute: false }
  >({ compute: false });
  const [computeTimer, setComputeTimer] = React.useState<null | NodeJS.Timeout>(
    null
  );

  React.useEffect(() => {
    // If we have local storage state on startup, then reload that
    const stored = localStorage.getStoredAppState();
    if (stored) {
      if (stored.version === CURRENT_APP_STATE_VERSION) {
        setStateRaw(stored);
        setDoCompute({ compute: true, startIndex: 0 });
      } else {
        // TODO Might be nice to tell the user we erased their previous stuff
        localStorage.clearAppState();
      }
    }
  }, []);

  const setState = React.useCallback(
    (
      fn: (oldState: AppState) => AppState,
      { compute }: { compute: 'no' | 'now' | 'later' }
    ) => {
      setStateRaw((oldState) => {
        const newState = fn(oldState);
        localStorage.saveAppState(newState);

        if (ENV === 'DEV') {
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
                }, COMPUTE_DEBOUNCE_MILLIS)
              );
            }
          }
        }

        return newState;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    debugLog('UseEffect, doCompute', doCompute);
    if (doCompute.compute === false) {
      return;
    }

    // TODO What happens if new changes come in while we're already computing?
    // Need to throw away previous results and calculate new ones.
    setDoCompute({ compute: false });
    (async () => {
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
        { compute: 'no' }
      );
      // TODO error handling
      await computeGifs({
        state,
        onCompute: (image, computeIdx) => {
          setState(
            (prevState) => ({
              ...prevState,
              effects: replaceIndex(
                prevState.effects,
                computeIdx,
                (t): AppStateEffect => ({
                  ...t,
                  state: { status: 'done', image },
                })
              ),
            }),
            { compute: 'no' }
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
      <Container maxWidth="sm">
        <Stack
          spacing={4}
          justifyContent="space-evenly"
          alignItems="center"
          width="sm"
          divider={<Divider />}
        >
          <Typography variant="h2" pt={4}>
            Partymoji
          </Typography>
          <Stack spacing={4} divider={<Divider />} alignItems="center">
            <Section>
              <Help />
            </Section>
            <Section>
              <Stack spacing={1} alignItems="center">
                <Typography variant="h5">Source Image</Typography>
                <ImagePicker
                  name="Choose a source image"
                  currentImageUrl={state.baseImage}
                  onChange={(baseImage) => {
                    setState(
                      (prevState) => ({
                        ...prevState,
                        baseImage,
                      }),
                      { compute: 'now' }
                    );
                  }}
                />
                <div style={{ maxWidth: '300px' }}>
                  {fpsParam.fn({
                    value: state.fps,
                    onChange: (fps) =>
                      setState(
                        (prevState) => ({
                          ...prevState,
                          fps,
                        }),
                        { compute: 'later' }
                      ),
                  })}
                </div>
              </Stack>
            </Section>
            <Section>
              <ImageEffectList
                appState={state}
                possibleEffects={POSSIBLE_EFFECTS}
                onEffectsChange={(effects) =>
                  setState(
                    (prevState) => ({
                      ...prevState,
                      effects,
                    }),
                    { compute: 'now' }
                  )
                }
                applyEffect={async (image, effect) => {
                  const result = await applyEffect({
                    state,
                    image,
                    effect,
                  });
                  return result.gif;
                }}
              />
            </Section>
            <Section>
              <ImportExport
                state={state}
                onImport={(o) => setState(() => o, { compute: 'now' })}
              />
            </Section>
            <Section>
              <Stack spacing={3}>
                <Typography variant="h5">Clear State</Typography>
                <Typography variant="body1">
                  Clicking this button will clear the source image and all
                  effects
                </Typography>
                <Button
                  startIcon={<Icon>clear</Icon>}
                  sx={{ maxWidth: '300px' }}
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    localStorage.clearAppState();
                    setStateRaw(DEFAULT_STATE);
                  }}
                >
                  Clear State
                </Button>
              </Stack>
            </Section>
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
    </>
  );
};

const Section: React.FC = ({ children }) => (
  <Paper style={{ padding: 16 }} sx={{ width: 300 }}>
    {children}
  </Paper>
);

// Icons at https://fonts.google.com/icons?selected=Material+Icons
