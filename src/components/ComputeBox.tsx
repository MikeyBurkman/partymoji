import React from 'react';
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Icon,
  Stack,
  Typography,
} from '@material-ui/core';

import { assert } from '../domain/utils';
import { runTransforms } from '../domain/run';
import { TransformInput, TransformWithParams } from '../domain/types';
import { intParam } from '../params/intParam';
import { transformByName } from '../transforms';

interface ComputeBoxProps {
  isDirty: boolean;
  computeDisabled: boolean;
  baseImageUrl?: string;
  transforms: TransformWithParams<any>[];
  onComputed: () => void;
}

type ComputeState =
  | {
      loading: false;
      results: { transformName: string; gif: string }[];
      computeTime: number | undefined;
    }
  | { loading: true };

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
    computeTime: undefined,
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
        endIcon={
          !state.loading && (isDirty || fpsChanged) ? (
            <Icon>priority_high</Icon>
          ) : undefined
        }
        disabled={buttonDisabled}
        onClick={async () => {
          const transformInputs = transforms.map(
            (t): TransformInput<any> => ({
              transform: transformByName(t.transformName),
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
              const start = Date.now();
              const gifs = await runTransforms(
                baseImageUrl,
                transformInputs,
                fps
              );
              const computeTime = Math.ceil((Date.now() - start) / 1000);
              setState({
                loading: false,
                computeTime,
                results: gifs.map((gif, idx) => ({
                  transformName: transforms[idx].transformName,
                  gif,
                })),
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
      {!state.loading && state.computeTime && (
        <Typography variant="caption">
          Compute Time: {state.computeTime} second(s)
        </Typography>
      )}
      <Divider />
      {!state.loading && (
        <Grid
          container
          spacing={2}
          padding={1}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {state.results.map(({ gif, transformName }, idx) => (
            <Grid item xs={4} sm={4} md={4}>
              <Typography variant="subtitle2">{transformName}</Typography>
              <img src={gif} alt={`gif-${transformName}-${idx}`}></img>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};
