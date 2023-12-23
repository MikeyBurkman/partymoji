import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { colorPickerParam } from '../params/colorPickerParam';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const dropShadow = buildEffect({
  name: 'Drop Shadow',
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
    mapFrames(image, (frame, frameIndex, frameCount) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          applyFilter(canvasData, {
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
