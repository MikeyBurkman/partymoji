import { buildTransform } from '../domain/types';
import { fromHexColor, mapImage, colorDiff } from '../domain/utils';
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

      const withinTolerance = colorDiff(src, selectedColor) * 100 <= tolerance;

      if (matchesTransparent ? withinTolerance : !withinTolerance) {
        return [src[0], src[1], src[2], 0];
      }
      return src;
    }
  ),
});
