import { buildEffect } from '../domain/types';
import { shiftTowardsHue } from '../domain/utils/color';
import { mapImage } from '../domain/utils/image';
import { bezierCurve } from '../domain/utils/misc';
import { huePickerParam, bezierParam } from '../params';

export const hueShiftPulse = buildEffect({
  name: 'Hue Shift Pulse',
  description: 'Shift the hue to the given value in a pulsating manner',
  params: [
    huePickerParam({
      name: 'Hue',
      defaultValue: 180,
    }),
    bezierParam({
      name: 'Easing',
      defaultValue: [
        [0.25, 0.75],
        [0.75, 0.25],
      ],
    }),
  ] as const,
  fn: mapImage(
    ({
      coord,
      getSrcPixel,
      frameCount,
      frameIndex,
      parameters: [hue, easing],
    }) => {
      const amount = bezierCurve(easing, true)(frameIndex / frameCount);
      return shiftTowardsHue(getSrcPixel(coord), hue, amount * 360);
    }
  ),
});
