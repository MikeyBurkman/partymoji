import { buildTransform } from '../domain/types';
import { fromHexColor, mapImage } from '../domain/utils';
import { colorPickerParam } from '../params/colorPickerParam';
import { sliderParam } from '../params/sliderParam';

export const transparentColor = buildTransform({
  name: 'Transparent Color',
  description:
    'All pixels similar in color to the chosen one will be made transparent',
  params: [
    colorPickerParam({
      name: 'Transparent Color',
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
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [color, tolerance] = parameters;
    const p = getSrcPixel(coord);
    const diff0 = p[0] - color[0];
    const diff1 = p[1] - color[1];
    const diff2 = p[2] - color[2];
    const diff = Math.sqrt(diff0 * diff0 + diff1 * diff1 + diff2 * diff2);
    if ((diff / 255) * 100 <= tolerance) {
      return [p[0], p[1], p[2], 0];
    }
    return p;
  }),
});
