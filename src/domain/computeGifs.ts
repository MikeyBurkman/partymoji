import { readImage, runTransforms } from './run';
import { runTransformsAsync } from './runAsync';
import { AppState, ImageTransformResult, TransformInput } from './types';
import { assert } from './utils';

const ENV = (window as any).ENV as 'DEV' | 'PROD';

export const computeGifs = async (
  appState: AppState,
  onCompute: (image: ImageTransformResult, idx: number) => void
): Promise<void> => {
  const transformInputs = appState.transforms.map(
    (t): TransformInput => ({
      transformName: t.transformName,
      params: t.paramsValues,
    })
  );

  assert(
    appState.baseImage,
    'No source image, this button should be disabled!'
  );

  let image = await readImage(appState.baseImage);

  // Can't get web workers working with the dev build, so just use the synchrounous version
  //  if not a prod build.
  const run = ENV === 'DEV' ? runTransforms : runTransformsAsync;
  for (let i = 0; i < transformInputs.length; i += 1) {
    const start = Date.now();

    const result = await run({
      randomSeed: appState.baseImage,
      image,
      transformInput: transformInputs[i],
      fps: appState.fps,
    });

    // Google analytics
    ga('send', {
      hitType: 'timing',
      timingCategory: 'computeStep',
      timingVar: transformInputs[i].transformName,
      timingValue: Math.ceil((Date.now() - start) / 1000),
    });

    image = result.image;

    onCompute(result, i);
  }
};
