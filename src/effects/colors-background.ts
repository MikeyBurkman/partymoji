import { buildEffect } from '../domain/types';
import {
  fromHexColor,
  isTransparent,
  mapImageWithPrecompute,
} from '../domain/utils';
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

export const colorsBackground = buildEffect({
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
          defaultValue: DEFAULT_COLORS[0],
        }),
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [colors] }) => ({
      bgColor: colors[Math.floor(animationProgress * colors.length)],
    }),
    ({ computed: { bgColor }, coord, getSrcPixel }) => {
      const srcPixel = getSrcPixel(coord);

      // Make the transparent parts colorful
      if (isTransparent(srcPixel)) {
        return bgColor;
      }

      return srcPixel;
    }
  ),
});
