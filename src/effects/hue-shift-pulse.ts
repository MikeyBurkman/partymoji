import { colorUtil, imageUtil, miscUtil } from '~/domain/utils';
import { huePickerParam, bezierParam } from '~/params';
import { buildEffect } from './utils';

export const hueShiftPulse = buildEffect({
  name: 'Hue Shift Pulse',
  group: 'Colors',
  description: 'Shift the hue to the given value in a pulsating manner',
  requiresAnimation: true,
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
  fn: imageUtil.mapImage(
    ({
      coord,
      getSrcPixel,
      frameCount,
      frameIndex,
      parameters: [hue, easing],
    }) => {
      const amount = miscUtil.bezierCurve(
        easing,
        true,
      )(frameIndex / frameCount);
      return colorUtil.shiftTowardsHue(getSrcPixel(coord), hue, amount * 360);
    },
  ),
});
