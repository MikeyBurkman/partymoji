import { buildEffect } from '../domain/types';
import { isTransparent, mapImage, shiftTowardsHue } from '../domain/utils';
import { huePickerParam } from '../params/huePickerParam';

export const hueShiftPulse = buildEffect({
  name: 'Hue Shift Pulse',
  description: 'Shift the hue to the given value in a pulsating manner',
  params: [
    huePickerParam({
      name: 'Hue',
      defaultValue: 180,
    }),
  ],
  fn: mapImage(
    ({ coord, getSrcPixel, frameCount, frameIndex, parameters: [hue] }) => {
      const srcPixel = getSrcPixel(coord);
      const isBackground = isTransparent(srcPixel);

      if (isBackground) {
        return srcPixel;
      }

      const amount = Math.abs(Math.sin(Math.PI * (frameIndex / frameCount)));
      return shiftTowardsHue(srcPixel, hue, amount * 360);
    }
  ),
});
