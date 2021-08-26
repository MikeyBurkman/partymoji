import React from 'react';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import {
  Container,
  Stack,
  Divider,
  Paper,
  Typography,
} from '@material-ui/core';

import { POSSIBLE_TRANSFORMS, transformByName } from './transforms';
import { ParamFunction, ParamValue } from './domain/types';
import { ComputeBox } from './components/ComputeBox';
import { ImagePicker } from './components/ImagePicker';
import { ImageTransformList } from './components/ImageTransformList';
import { ImportExport } from './components/ImportExport';

// Set to true to print out the current state at the bottom of the page
const DEBUG = false;

type AppState = {
  baseImage?: string;
  transforms: {
    transformName: string;
    paramsValues: ParamValue<any>[];
    computedImage?: string;
  }[];
  dirty: boolean;
};

export const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>({
    dirty: false,
    transforms: [],
    baseImage: undefined,
  });

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
    <>
      <ScopedCssBaseline />
      <Container>
        <Stack spacing={4} justifyContent="space-evenly" divider={<Divider />}>
          <Typography variant="h2" pt={4}>
            Partymoji
          </Typography>
          <Stack spacing={4} divider={<Divider />}>
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
                isDirty={state.dirty}
                baseImageUrl={state.baseImage}
                computeDisabled={computeBtnDisbled}
                transforms={state.transforms}
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
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
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
