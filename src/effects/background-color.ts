import { buildEffect } from '../domain/types';
import {
  applyCanvasFromFrame,
  applyFilter,
  combineImages,
} from '../domain/utils/canvas';
import { fromHexColor } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { colorPickerParam } from '../params/colorPickerParam';
import { sliderParam } from '../params/sliderParam';

export const backgroundColor = buildEffect({
  name: 'Background Color',
  description: 'Change all transparent pixles to the given color',
  params: [
    colorPickerParam({
      name: 'Color',
      defaultValue: fromHexColor('#000000'),
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [color, opacity] }) =>
    mapFrames(image, (frame) => {
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
        background: mapCoords(image.dimensions, () => color),
        foreground,
      });
    }),
});
