import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const party = buildEffect({
  name: 'Party',
  description: 'Shift the hue of the image over the course of the animation',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
  ] as const,
  fn: ({ image, parameters: [speed] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, {
            hueRotate: (frameIndex / frameCount) * 360 * speed,
          }),
      })
    ),
});
