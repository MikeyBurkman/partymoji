import { buildTransform } from '../types';
import { mapImage, isTransparent, fromHexColor } from '../utils';
import { colorPickerParam } from './params/colorPickerParam';

export const solidBackground = buildTransform({
  name: 'Solid Background',
  params: [
    colorPickerParam({
      name: 'Background Color',
      defaultValue: fromHexColor('#FFFFFF'),
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [color] = parameters;
    const p = getSrcPixel(coord);
    return isTransparent(p) ? color : p;
  }),
});
