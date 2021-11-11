import { buildTransform } from '../domain/types';
import { fromHexColor, isTransparent, mapImage } from '../domain/utils';
import { colorPickerParam } from '../params/colorPickerParam';
import { variableLengthParam } from '../params/variableLengthParam';

const DEFAULT_COLORS = [
  '#FF8D8B',
  '#FED689',
  '#88FF89',
  '#87FFFF',
  '#8BB5FE',
  '#D78CFF',
  '#FF8CFF',
  '#FF68F7',
  '#FE6CB7',
  '#FF6968',
].map(fromHexColor);

export const colorsBackground = buildTransform({
  name: 'Colors Background',
  description: 'Transparent pixels will flash different colors',
  params: [
    variableLengthParam({
      name: 'Colors',
      newParamText: 'New Color',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
        }),
    }),
  ] as const,
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const srcPixel = getSrcPixel(coord);

    const [colors] = parameters;

    // Make the transparent parts colorful
    if (isTransparent(srcPixel)) {
      const colorIdx = Math.floor((frameIndex / frameCount) * colors.length);
      return colors[colorIdx];
    }

    return srcPixel;
  }),
});
