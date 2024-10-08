import { range } from 'remeda';
import { colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, variableLengthParam } from '~/params';
import { buildEffect } from './utils';

const NUM_DEFAULT_COLORS = 6;
const DEFAULT_COLORS = range(0, NUM_DEFAULT_COLORS).map((v) =>
  colorUtil.setBrightness(
    colorUtil.fromHexColor('#98651B'),
    (1 - v / NUM_DEFAULT_COLORS) * 100
  )
);

export const colorPalette = buildEffect({
  name: 'Color Palette',
  group: 'Colors',
  description: 'Change all colors in the image to a set palette.',
  secondaryDescription:
    'For instance, the lightest colors in the source image will ' +
    'be replaced by the first color, and the darkest colors in the source image will be ' +
    'replaced by the last color, etc',
  params: [
    variableLengthParam({
      name: 'Palette',
      newParamText: 'New Color',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
          defaultValue: DEFAULT_COLORS[0],
        }),
    }),
  ] as const,
  fn: imageUtil.mapImage(({ coord, getSrcPixel, parameters: [palette] }) => {
    const src = getSrcPixel(coord);
    if (colorUtil.isTransparent(src)) {
      return src;
    }

    const gray = 255 - colorUtil.getAveragePixelValue(src);
    const paletteIndex = Math.floor((gray / 256) * palette.length);
    return palette[paletteIndex];
  }),
});
