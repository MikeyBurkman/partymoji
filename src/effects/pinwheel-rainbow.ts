import { buildEffect, Coord } from '../domain/types';
import { shiftTowardsHue } from '../domain/utils/color';
import { calculateAngle } from '../domain/utils/misc';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelRainbow = buildEffect({
  name: 'Pinwheel Rainbow',
  description: 'Make the image look like a pinwheel rainbow',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    sliderParam({
      name: 'Strength',
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
      parameters: [groupCount, strength],
    }) => {
      const srcPixel = getSrcPixel(coord);

      const pointAngle = calculateAngle(coord, center);
      const newH = (pointAngle * groupCount + animationProgress * 360) % 360;

      return shiftTowardsHue(srcPixel, newH, strength);
    }
  ),
});
