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
import { computeGifs } from './domain/computeGifs';
import { AppState, AppStateEffect } from './domain/types';
import { replaceIndex } from './domain/utils';
import * as localStorage from './localStorage';
import { sliderParam } from './params/sliderParam';
import { POSSIBLE_EFFECTS } from './effects';

// Set to true to expose the current state as window.STATE.
const DEBUG = false;

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
  const [doCompute, setDoCompute] = React.useState(false);
  const [computeTimer, setComputeTimer] = React.useState<null | NodeJS.Timeout>(
    null
  );

  React.useEffect(() => {
    // If we have local storage state on startup, then reload that
    const stored = localStorage.getStoredAppState();
    if (stored) {
      if (stored.version === CURRENT_APP_STATE_VERSION) {
        setStateRaw(stored);
        setDoCompute(true);
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

        if (DEBUG) {
          (window as any).STATE = newState;
        }

        if (compute !== 'no') {
          // Compute the gif some time from now.
          // Other changes within this time should push the compute time back
          if (computeTimer) {
            clearTimeout(computeTimer);
            setComputeTimer(null);
          }

          if (compute === 'now') {
            setDoCompute(true);
          } else {
            setDoCompute(false);
            setComputeTimer(
              setTimeout(() => {
                setComputeTimer(null);
                setDoCompute(true);
              }, COMPUTE_DEBOUNCE_MILLIS)
            );
          }
        }

        return newState;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    if (!doCompute) {
      return;
    }

    // TODO What happens if new changes come in while we're already computing?
    // Need to throw away previous results and calculate new ones.
    setDoCompute(false);
    (async () => {
      setState(
        (prevState) => ({
          ...prevState,
          effects: prevState.effects.map(
            (t): AppStateEffect => ({
              ...t,
              state: { status: 'computing' },
            })
          ),
        }),
        { compute: 'no' }
      );
      // TODO error handling
      await computeGifs(state, (image, computeIdx) => {
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
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doCompute]);

  return (
    <>
      <ScopedCssBaseline />
      <Container maxWidth="md">
        <Stack spacing={4} justifyContent="space-evenly" divider={<Divider />}>
          <Typography variant="h2" pt={4}>
            Partymoji
          </Typography>
          <Stack spacing={4} divider={<Divider />}>
            {DEBUG && (
              <Paper style={{ padding: 16 }}>
                <Help />
              </Paper>
            )}
            <Paper style={{ padding: 16 }}>
              <Stack spacing={1}>
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
            </Paper>
            <Paper style={{ padding: 16 }}>
              <ImageEffectList
                currentEffect={state.effects}
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
              />
            </Paper>
            <Paper style={{ padding: 16 }}>
              <ImportExport
                state={state}
                onImport={(o) => setState(() => o, { compute: 'now' })}
              />
            </Paper>
            <Paper style={{ padding: 16 }}>
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
                  onClick={() => {
                    localStorage.clearAppState();
                    setStateRaw(DEFAULT_STATE);
                  }}
                >
                  Clear State
                </Button>
              </Stack>
            </Paper>
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
