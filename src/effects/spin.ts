import { canvasUtil, imageUtil } from '~/domain/utils';
import { radioParam } from '~/params';
import { buildEffect } from './utils';

export const spin = buildEffect({
  name: 'Spin',
  description: 'Make the image rotate about the center point in an animation',
  params: [
    radioParam<'clockwise' | 'counter'>({
      name: 'Direction',
      defaultValue: 'clockwise',
      options: [
        { name: 'Clockwise', value: 'clockwise' },
        { name: 'Counter-Clockwise', value: 'counter' },
      ],
    }),
  ] as const,
  fn: ({ image, parameters: [direction] }) =>
    imageUtil.mapFrames(image, (frame, idx, frameCount) => {
      const angle =
        (((direction === 'counter' ? 1 : -1) * idx) / frameCount) * 360;
      return canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => canvasUtil.applyRotation(canvasData, angle),
      });
    }),
});
