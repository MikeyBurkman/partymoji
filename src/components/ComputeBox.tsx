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
import React from 'react';
import { readImage, runTransforms } from '../domain/run';
import { runTransformsAsync } from '../domain/runAsync';
import {
  AppState,
  ImageTransformResult,
  TransformInput,
} from '../domain/types';
import { assert } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

const ENV = (window as any).ENV as 'DEV' | 'PROD';

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
            (t): TransformInput => ({
              transformName: t.transformName,
              params: t.paramsValues.map((p) => {
                assert(p.valid, 'Got non-valid when compute box was clicked');
                return p.value;
              }),
            })
          );
          setComputeState({ loading: true });
          try {
            assert(
              appState.baseImage,
              'No source image, this button should be disabled!'
            );
            const start = Date.now();
            const timings: number[] = [];
            setProgress(0);

            const originalImage = await readImage(appState.baseImage);

            const results: ImageTransformResult[] = [];

            // Can't get web workers working with the dev build, so just use the synchrounous version
            //  if not a prod build.
            await (ENV === 'DEV' ? runTransforms : runTransformsAsync)(
              {
                inputDataUrl: appState.baseImage,
                originalImage,
                transformList: transformInputs,
                fps: appState.fps,
              },
              (image) => {
                results.push(image);
                setProgress((results.length / transformInputs.length) * 100);
                setComputeState({
                  loading: false,
                  computeTime: undefined,
                  results: results.map((result, idx) => ({
                    transformName: appState.transforms[idx].transformName,
                    gif: result.gif,
                  })),
                });
              }
            );

            const computeTime = Math.ceil((Date.now() - start) / 1000);
            setComputeState({
              loading: false,
              computeTime,
              results: results.map((result: any, idx: number) => ({
                transformName: appState.transforms[idx].transformName,
                gif: result.gif,
              })),
            });

            // Google analytics
            timings.forEach((timingValue, idx) => {
              ga('send', {
                hitType: 'timing',
                timingCategory: 'computeStep',
                timingVar: appState.transforms[idx].transformName,
                timingValue,
              });
            });
            ga('send', {
              hitType: 'timing',
              timingCategory: 'computeTotal',
              timingVar: appState.transforms.length,
              timingValue: computeTime,
            });

            setProgress(undefined);
            onComputed();
          } catch (err) {
            console.error(err);
            console.error((err as any).stack);
          }
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
