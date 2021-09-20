import { buildTransform, Color } from '../domain/types';
import { fromHexColor, mapImage } from '../domain/utils';
import { checkboxParam } from '../params/checkboxParam';
import { colorPickerParam } from '../params/colorPickerParam';
import { sliderParam } from '../params/sliderParam';

export const transparency = buildTransform({
  name: 'Transparency',
  description: 'Set certain pixels to be transparent',
  params: [
    checkboxParam({
      name: 'Matches are Transparent',
      description:
        'If checked, then pixels matching this color will be made transparent. If not checked, non-matching pixels are transparent.',
      defaultValue: true,
    }),
    colorPickerParam({
      name: 'Color',
      defaultValue: fromHexColor('#000000'),
    }),
    sliderParam({
      name: 'Tolerance',
      description:
        'A higher number will mean colors that are "close" to the chosen color will be transparent. (0 - 100)',
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 5,
    }),
  ] as const,
  fn: mapImage(
    ({
      coord,
      getSrcPixel,
      parameters: [matchesTransparent, selectedColor, tolerance],
    }) => {
      const src = getSrcPixel(coord);

      const diff = redmeanColorDiff(src, selectedColor) * 100;

      const withinTolerance = diff <= tolerance;

      if (matchesTransparent ? withinTolerance : !withinTolerance) {
        return [src[0], src[1], src[2], 0];
      }
      return src;
    }
  ),
});

// Returns number between 0 and 1, where 1 is the largest difference and 0 is no difference
const redmeanColorDiff = (c1: Color, c2: Color): number => {
  // https://en.wikipedia.org/wiki/Color_difference
  const deltaRed = c1[0] - c2[0];
  const deltaBlue = c1[1] - c2[1];
  const deltaGreen = c1[2] - c2[2];
  const rSomething = (c1[0] + c2[0]) / 2;

  const rComponent = (2 + rSomething / 256) * deltaRed * deltaRed;
  const bComponent = (2 + (255 - rSomething) / 256) * deltaBlue * deltaBlue;
  const gComponent = 4 * deltaGreen * deltaGreen;
  // 765 = ~ difference between black and white pixels
  return Math.sqrt(rComponent + bComponent + gComponent) / 765;
};
