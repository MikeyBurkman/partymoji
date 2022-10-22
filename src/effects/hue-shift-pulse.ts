import { buildEffect } from '../domain/types';
import { shiftTowardsHue } from '../domain/utils/color';
import { mapImage } from '../domain/utils/image';
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
      const amount = Math.abs(Math.sin(Math.PI * (frameIndex / frameCount)));
      return shiftTowardsHue(getSrcPixel(coord), hue, amount * 360);
    }
  ),
});
