import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

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
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => canvasUtil.applyRotation(canvasData, angle),
      })
    ),
});
