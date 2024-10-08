import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const backgroundColor = buildEffect({
  name: 'Background Color',
  group: 'Colors',
  description: 'Change all transparent pixels to the given color',
  params: [
    colorPickerParam({
      name: 'Color',
      defaultValue: colorUtil.fromHexColor('#000000'),
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [color, opacity] }) =>
    imageUtil.mapFrames(image, (frame) => {
      const foreground =
        opacity === 100
          ? frame
          : canvasUtil.applyCanvasFromFrame({
              dimensions: image.dimensions,
              frame,
              preEffect: (canvasData) =>
                canvasUtil.applyFilter(canvasData, { opacity }),
            });

      return canvasUtil.combineImages({
        dimensions: image.dimensions,
        background: imageUtil.mapCoords(image.dimensions, () => color),
        foreground,
      });
    }),
});
