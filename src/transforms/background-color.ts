import { buildTransform } from '../domain/types';
import { fromHexColor, isTransparent, mapImage } from '../domain/utils';
import { colorPickerParam } from '../params/colorPickerParam';

export const backgroundColor = buildTransform({
  name: 'Background Color',
  description: 'Change all transparent pixles to the given color',
  params: [
    colorPickerParam({
      name: 'Color',
      defaultValue: fromHexColor('#000000'),
    }),
  ] as const,
  fn: mapImage(({ coord, getSrcPixel, parameters: [color] }) => {
    const p = getSrcPixel(coord);
    return isTransparent(p) ? color : p;
  }),
});
