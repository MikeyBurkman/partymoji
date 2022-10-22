import { buildEffect } from '../domain/types';
import { shiftTowardsHue } from '../domain/utils/color';
import { mapImage } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const party = buildEffect({
  name: 'Party',
  description: 'Shift the hue of the image over the course of the animation',
  params: [
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    }),
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
  ] as const,
  fn: mapImage(
    ({
      coord,
      getSrcPixel,
      animationProgress,
      parameters: [amount, shiftSpeed],
    }) => {
      const newH = (animationProgress * shiftSpeed * 360) % 360;
      const srcPixel = getSrcPixel(coord);
      return shiftTowardsHue(srcPixel, newH, amount);
    }
  ),
});
