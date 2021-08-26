import React from 'react';
import {
  Button,
  CircularProgress,
  Divider,
  Icon,
  Stack,
  Typography,
} from '@material-ui/core';

import { assert } from '../domain/utils';
import { runTransforms } from '../domain/run';
import { TransformInput, TransformWithParams } from '../domain/types';
import { intParam } from '../params/intParam';

interface ComputeBoxProps {
  isDirty: boolean;
  computeDisabled: boolean;
  baseImageUrl?: string;
  transforms: TransformWithParams<any>[];
  onComputed: () => void;
}

type ComputeState = { loading: false; results: string[] } | { loading: true };

const DEFAULT_FPS = 20;
const fpsParam = intParam({
  name: 'Frames per Second',
  defaultValue: DEFAULT_FPS,
  min: 0,
});

export const ComputeBox: React.FC<ComputeBoxProps> = ({
  isDirty,
  computeDisabled,
  baseImageUrl,
  transforms,
  onComputed,
}) => {
  const [state, setState] = React.useState<ComputeState>({
    loading: false,
    results: [],
  });
  const [fpsChanged, setFpsChanged] = React.useState(false);
  const [fps, setFps] = React.useState(DEFAULT_FPS);

  const buttonDisabled = computeDisabled && !fpsChanged;

  return (
    <Stack spacing={1}>
      <Typography variant="h5">Create Gif</Typography>

      {fpsParam.fn({
        value: { valid: true, value: fps },
        onChange: (x) => {
          if (x.valid) {
            setFps(x.value);
            setFpsChanged(true);
          }
        },
      })}
      <Button
        variant="contained"
        endIcon={isDirty || fpsChanged ? <Icon>priority_high</Icon> : undefined}
        disabled={buttonDisabled}
        onClick={async () => {
          const transformInputs = transforms.map(
            (t): TransformInput<any> => ({
              transform: t.transform,
              params: t.paramsValues.map((p) => {
                assert(p.valid);
                return p.value;
              }),
            })
          );
          setState({ loading: true });
          setTimeout(async () => {
            try {
              assert(
                baseImageUrl,
                'No source image, this button should be disabled!'
              );
              const gifs = await runTransforms(
                baseImageUrl,
                transformInputs,
                fps
              );
              setState({
                loading: false,
                results: gifs,
              });
              setFpsChanged(false);
              onComputed();
            } catch (err) {
              console.error(err);
              console.error(err.stack);
            }
          });
        }}
      >
        {state.loading ? <CircularProgress color="inherit" /> : 'Compute'}
      </Button>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row', md: 'row' }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
      >
        {!state.loading &&
          state.results.map((gif, idx) => (
            <div>
              <Typography variant="subtitle2">
                {transforms[idx].transform.name}
              </Typography>
              <img
                src={gif}
                alt={`gif-${transforms[idx].transform.name}`}
              ></img>
            </div>
          ))}
      </Stack>
    </Stack>
  );
};
