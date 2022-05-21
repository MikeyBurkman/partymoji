import { readImage, runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, ImageEffectResult, EffectInput } from './types';
import { assert } from './utils';

const ENV = (window as any).ENV as 'DEV' | 'PROD';

export const computeGifs = async (
  appState: AppState,
  onCompute: (image: ImageEffectResult, idx: number) => void
): Promise<void> => {
  const effectInputs = appState.effects.map(
    (t): EffectInput => ({
      effectName: t.effectName,
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
  const run = ENV === 'DEV' ? runEffects : runEffectsAsync;
  for (let i = 0; i < effectInputs.length; i += 1) {
    const start = Date.now();

    const result = await run({
      randomSeed: appState.baseImage,
      image,
      effectInput: effectInputs[i],
      fps: appState.fps,
    });

    // Google analytics
    ga('send', {
      hitType: 'timing',
      timingCategory: 'computeStep',
      timingVar: effectInputs[i].effectName,
      timingValue: Math.ceil((Date.now() - start) / 1000),
    });

    image = result.image;

    onCompute(result, i);
  }
};
