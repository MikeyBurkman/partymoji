import { buildEffect } from '../domain/types';
import {
  combineImages,
  applyCanvasFromFrame,
  applyFilter,
} from '../domain/utils/canvas';
import { fromHexColor } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { colorPickerParam } from '../params/colorPickerParam';
import { sliderParam } from '../params/sliderParam';
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
  description:
    'Transparent pixels will flash different colors of your choosing',
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
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [colors, opacity] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const bgColor = colors[Math.floor(animationProgress * colors.length)];

      const foreground =
        opacity === 100
          ? frame
          : applyCanvasFromFrame({
              dimensions: image.dimensions,
              frame,
              preEffect: (canvasData) => applyFilter(canvasData, { opacity }),
            });

      return combineImages({
        dimensions: image.dimensions,
        background: mapCoords(image.dimensions, () => bgColor),
        foreground,
      });
    }),
});
