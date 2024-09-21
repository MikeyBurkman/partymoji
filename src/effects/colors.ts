import { colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, sliderParam, variableLengthParam } from '~/params';
import { buildEffect } from './utils';

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
].map(colorUtil.fromHexColor);

export const colors = buildEffect({
  name: 'Colors',
  group: 'Colors',
  description: 'Make the image flash different colors of your choosing',
  secondaryDescription: 'Increase the brightness to increase the effect',
  params: [
    sliderParam({
      name: 'Brightness Increase',
      defaultValue: 0,
      min: 0,
      max: 100,
      step: 5,
    }),
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
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress, parameters: [brightnessIncrease, colors] }) => ({
      brightnessIncrease,
      chosenColor: colors[Math.floor(animationProgress * colors.length)],
    }),
    ({ computed: { brightnessIncrease, chosenColor }, coord, getSrcPixel }) => {
      const srcPixel = getSrcPixel(coord);

      if (colorUtil.isTransparent(srcPixel)) {
        return [0, 0, 0, 0];
      }

      const brightnessAdjusted =
        brightnessIncrease > 0
          ? colorUtil.adjustBrightness(srcPixel, brightnessIncrease)
          : srcPixel;
      const gray = colorUtil.getAveragePixelValue(brightnessAdjusted);

      return [
        (gray * chosenColor[0]) / 255,
        (gray * chosenColor[1]) / 255,
        (gray * chosenColor[2]) / 255,
        255,
      ];
    }
  ),
});
