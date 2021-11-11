import { buildTransform } from '../domain/types';
import {
  colorFromHue,
  isTransparent,
  mapImage,
  shiftHue,
} from '../domain/utils';
import { radioParam } from '../params/radioParam';
import { sliderParam } from '../params/sliderParam';

export const party = buildTransform({
  name: 'Party',
  description: 'Party time!',
  params: [
    radioParam({
      name: 'Type',
      description: 'Whether to apply the party to the foreground or background',
      defaultValue: 'background',
      options: [
        {
          name: 'Background',
          value: 'background',
        },
        {
          name: 'Foreground',
          value: 'foreground',
        },
      ],
    }),
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
      frameCount,
      frameIndex,
      parameters: [type, amount, shiftSpeed],
    }) => {
      const srcPixel = getSrcPixel(coord);
      const isBackground = isTransparent(srcPixel);

      const newH = ((frameIndex / frameCount) * shiftSpeed * 360) % 360;

      if (isBackground && type === 'background') {
        return colorFromHue(newH);
      }

      if (!isBackground && type === 'foreground') {
        return shiftHue(srcPixel, newH, amount);
      }

      return srcPixel;
    }
  ),
});
