import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyRotation } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { radioParam } from '../params/radioParam';

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
    mapFrames(image, (frame, idx, frameCount) => {
      const angle =
        (((direction === 'counter' ? 1 : -1) * idx) / frameCount) * 360;
      return applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => applyRotation(canvasData, angle),
      });
    }),
});
