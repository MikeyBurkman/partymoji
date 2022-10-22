import { buildEffect, Coord } from '../domain/types';
import {
  isTransparent,
  calculateAngle,
  shiftTowardsHue,
} from '../domain/utils/color';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelParty = buildEffect({
  name: 'Pinwheel Party',
  description: 'Make the image look like a pinwheel party',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is.',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
    }),
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
      defaultValue: 0,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({
      dimensions: [width, height],
      parameters: [groupCount, amount, offsetX, offsetY],
    }) => {
      const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];
      return { center };
    },
    ({
      computed: { center },
      coord,
      animationProgress,
      getSrcPixel,
      parameters: [groupCount, amount],
    }) => {
      const srcPixel = getSrcPixel(coord);

      const isBackground = isTransparent(srcPixel);

      if (isBackground) {
        return srcPixel;
      }

      const pointAngle = calculateAngle(coord, center);
      const newH = (pointAngle * groupCount + animationProgress * 360) % 360;

      return shiftTowardsHue(srcPixel, newH, amount);
    }
  ),
});
