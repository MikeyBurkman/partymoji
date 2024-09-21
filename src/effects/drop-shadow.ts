import { canvasUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, sliderParam, intParam } from '~/params';
import { buildEffect } from './utils';

export const dropShadow = buildEffect({
  name: 'Drop Shadow',
  group: 'Misc',
  description: 'Adds a drop shadow effect to the image',
  params: [
    intParam({
      name: 'Offset X',
      defaultValue: 10,
    }),
    intParam({
      name: 'Offset Y',
      defaultValue: 10,
    }),
    sliderParam({
      name: 'Blur Radius',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: 0,
    }),
    colorPickerParam({
      name: 'Shadow Color',
      defaultValue: [0, 0, 0, 0],
    }),
  ] as const,
  fn: ({ image, parameters: [offsetX, offsetY, blurRadius, color] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, {
            dropShadow: {
              offsetX,
              offsetY,
              blurRadius,
              color,
            },
          }),
      })
    ),
});
