import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyRotation } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const rotate = buildEffect({
  name: 'Rotate',
  description: 'Rotes the image to a given angle',
  params: [
    sliderParam({
      name: 'Angle',
      defaultValue: 0,
      min: 0,
      max: 360,
      step: 5,
      description:
        'The angle in degrees. 0 degrees points to the right, 90 degrees points up.',
    }),
  ],
  fn: ({ image, parameters: [angle] }) =>
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => applyRotation(canvasData, angle),
      })
    ),
});
