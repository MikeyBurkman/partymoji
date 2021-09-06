import React from 'react';
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Icon,
  LinearProgress,
  Stack,
  Typography,
} from '@material-ui/core';

import { assert } from '../domain/utils';
import { runTransforms } from '../domain/run';
import { AppState, TransformInput } from '../domain/types';
import { transformByName } from '../transforms';
import { sliderParam } from '../params/sliderParam';

interface ComputeBoxProps {
  computeDisabled: boolean;
  appState: AppState;
  onFpsChange: (fps: number) => void;
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
const fpsParam = sliderParam({
  name: 'Frames per Second',
  defaultValue: DEFAULT_FPS,
  min: 1,
  max: 60,
});

export const ComputeBox: React.FC<ComputeBoxProps> = ({
  computeDisabled,
  appState,
  onFpsChange,
  onComputed,
}) => {
  const [computeState, setComputeState] = React.useState<ComputeState>({
    loading: false,
    results: [],
    computeTime: undefined,
  });
  const [progress, setProgress] = React.useState<number | undefined>();

  return (
    <Stack spacing={1}>
      <Typography variant="h5">Create Gif</Typography>

      <div style={{ maxWidth: '300px' }}>
        {fpsParam.fn({
          value: { valid: true, value: appState.fps },
          onChange: (x) => {
            if (x.valid) {
              onFpsChange(x.value);
            }
          },
        })}
      </div>
      <Button
        variant="contained"
        sx={{ maxWidth: '300px' }}
        endIcon={
          !computeState.loading && appState.dirty ? (
            <Icon>priority_high</Icon>
          ) : undefined
        }
        disabled={computeDisabled}
        onClick={async () => {
          const transformInputs = appState.transforms.map(
            (t): TransformInput<any> => ({
              transform: transformByName(t.transformName),
              params: t.paramsValues.map((p) => {
                assert(p.valid);
                return p.value;
              }),
            })
          );
          setComputeState({ loading: true });
          setTimeout(async () => {
            try {
              assert(
                appState.baseImage,
                'No source image, this button should be disabled!'
              );
              const start = Date.now();
              let currIdx = 0;
              setProgress(0);
              const results = await runTransforms({
                inputDataUrl: appState.baseImage,
                transformList: transformInputs,
                fps: appState.fps,
                onImageFinished: () => {
                  currIdx += 1;
                  setProgress((currIdx / transformInputs.length) * 100);
                },
              });
              const computeTime = Math.ceil((Date.now() - start) / 1000);
              setComputeState({
                loading: false,
                computeTime,
                results: results.map((result, idx) => ({
                  transformName: appState.transforms[idx].transformName,
                  gif: result.gif,
                })),
              });
              setProgress(undefined);
              onComputed();
            } catch (err) {
              console.error(err);
              console.error((err as any).stack);
            }
          });
        }}
      >
        {computeState.loading ? (
          <CircularProgress color="inherit" />
        ) : (
          'Compute'
        )}
      </Button>
      {progress !== undefined && (
        <LinearProgress variant="determinate" value={progress} />
      )}
      {!computeState.loading && computeState.computeTime !== undefined && (
        <>
          <Divider />
          <Typography variant="caption">
            Compute Time: {computeState.computeTime} second(s)
          </Typography>
        </>
      )}

      {!computeState.loading && computeState.results.length > 0 && (
        <>
          <Divider />
          <Grid
            container
            spacing={2}
            padding={1}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            {computeState.results.map(({ gif, transformName }, idx) => (
              <Grid item xs={4} sm={4} md={4} key={`${transformName}-${idx}`}>
                <Typography variant="subtitle2">{transformName}</Typography>
                <img
                  src={gif}
                  alt={`gif-${transformName}-${idx}`}
                  style={{ maxWidth: '300px', maxHeight: 'auto' }}
                ></img>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Stack>
  );
};
