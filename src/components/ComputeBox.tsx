import {
  Button,
  CircularProgress,
  Divider,
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
  onComputed: (results: ImageTransformResult[]) => void;
}

type ComputeState =
  | {
      loading: false;
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
    computeTime: undefined,
  });
  const [progress, setProgress] = React.useState<number | undefined>();

  return (
    <Stack spacing={1}>
      <Typography variant="h5">Create Gif</Typography>

      <div style={{ maxWidth: '300px' }}>
        {fpsParam.fn({
          value: appState.fps,
          onChange: onFpsChange,
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
              params: t.paramsValues,
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

            let image = await readImage(appState.baseImage);
            const results: ImageTransformResult[] = [];

            // Can't get web workers working with the dev build, so just use the synchrounous version
            //  if not a prod build.
            const run = ENV === 'DEV' ? runTransforms : runTransformsAsync;
            for (let i = 0; i < transformInputs.length; i += 1) {
              const result = await run({
                randomSeed: appState.baseImage,
                image,
                transformInput: transformInputs[i],
                fps: appState.fps,
              });

              image = result.image;

              results.push(result);
              setProgress((results.length / transformInputs.length) * 100);
            }

            const computeTime = Math.ceil((Date.now() - start) / 1000);
            setComputeState({
              loading: false,
              computeTime,
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
            onComputed(results);
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
    </Stack>
  );
};
