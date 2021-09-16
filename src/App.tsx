import React from 'react';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import {
  Container,
  Stack,
  Divider,
  Paper,
  Typography,
  Button,
  Icon,
} from '@material-ui/core';

import { POSSIBLE_TRANSFORMS, transformByName } from './transforms';
import { ParamFunction, AppState } from './domain/types';
import { ComputeBox } from './components/ComputeBox';
import { ImagePicker } from './components/ImagePicker';
import { ImageTransformList } from './components/ImageTransformList';
import { ImportExport } from './components/ImportExport';
import { Help } from './components/Help';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary';

// Set to true to print out the current state at the bottom of the page
const DEBUG = false;

const LOCAL_STORAGE_KEY = 'partymoji-state';

const DEFAULT_STATE: AppState = {
  dirty: false,
  transforms: [],
  baseImage: undefined,
  fps: 20,
};

export const App: React.FC = () => {
  const [state, setStateRaw] = React.useState(DEFAULT_STATE);

  React.useEffect(() => {
    // If we have local storage state on startup, then reload that
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const savedState = JSON.parse(stored);
        if (!Array.isArray(savedState.transforms)) {
          // Dunno what we just loaded, not the right thing
          return;
        }

        setStateRaw({ ...savedState, dirty: true });
      }
    } catch (err) {
      // @ts-ignore
      console.error('Error loading state from local storage', err.stack || err);
    }
  }, []);

  const setState = (newState: AppState) => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      // @ts-ignore
      console.error('Error saving state to local storage', err.stack || err);
    }
    setStateRaw(newState);
  };

  if (DEBUG) {
    (window as any).STATE = state;
  }

  const computeBtnDisbled =
    !state.baseImage ||
    state.transforms.length === 0 ||
    !state.dirty ||
    state.transforms.some((t) => {
      const params = transformByName(t.transformName)
        .params as ParamFunction<any>[];
      return (
        params.length > 0 && t.paramsValues.every((p, i) => p.valid === false)
      );
    });

  return (
    <TopLevelErrorBoundary
      onClearLocalStorage={() => {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        window.location.reload();
      }}
    >
      <ScopedCssBaseline />
      <Container>
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
                    setState({
                      ...state,
                      baseImage,
                      dirty: true,
                    });
                  }}
                />
              </Stack>
            </Paper>
            <Paper style={{ padding: 16 }}>
              <ImageTransformList
                currentTransforms={state.transforms}
                possibleTransforms={POSSIBLE_TRANSFORMS}
                onTransformsChange={(transforms) =>
                  setState({
                    ...state,
                    dirty: true,
                    transforms,
                  })
                }
              />
            </Paper>
            <Paper style={{ padding: 16 }}>
              <ComputeBox
                computeDisabled={computeBtnDisbled}
                appState={state}
                onFpsChange={(fps) =>
                  setState({
                    ...state,
                    fps,
                    dirty: true,
                  })
                }
                onComputed={() =>
                  setState({
                    ...state,
                    dirty: false,
                  })
                }
              />
            </Paper>
            <Paper style={{ padding: 16 }}>
              <ImportExport
                state={state}
                onImport={(newState) => setState({ ...newState, dirty: true })}
              />
            </Paper>
            <Paper style={{ padding: 16 }}>
              <Stack spacing={3}>
                <Typography variant="h5">Clear State</Typography>
                <Typography variant="body1">
                  Clicking this button will clear the source image and all
                  transforms
                </Typography>
                <Button
                  startIcon={<Icon>clear</Icon>}
                  sx={{ maxWidth: '300px' }}
                  variant="contained"
                  onClick={() => {
                    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
                    setStateRaw(DEFAULT_STATE);
                  }}
                >
                  Clear State
                </Button>
              </Stack>
            </Paper>
            {DEBUG && (
              <div>
                <code>{JSON.stringify(state, null, 2)}</code>
              </div>
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
    </TopLevelErrorBoundary>
  );
};
