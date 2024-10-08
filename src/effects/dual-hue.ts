import { colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam } from '~/params';
import { buildEffect } from './utils';

export const dualHue = buildEffect({
  name: 'Dual Hue',
  group: 'Colors',
  description:
    'The colors of the image will transition from one color to another',
  params: [
    colorPickerParam({
      name: 'Color 1',
      defaultValue: [255, 0, 0, 1],
    }),
    colorPickerParam({
      name: 'Color 2',
      defaultValue: [0, 255, 0, 1],
    }),
  ] as const,
  fn: imageUtil.mapImage(
    ({ coord, getSrcPixel, parameters: [color1, color2] }) => {
      const src = getSrcPixel(coord);
      if (colorUtil.isTransparent(src)) {
        return src;
      }

      const amount = colorUtil.getAveragePixelValue(src) / 256;
      return colorUtil.linearInterpolation({ c1: color1, c2: color2, amount });
    }
  ),
});
