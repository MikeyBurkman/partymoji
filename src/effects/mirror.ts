import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyTransform } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';

export const mirror = buildEffect({
  name: 'Mirror',
  description: 'Mirrors the image',
  params: [],
  fn: ({ image }) =>
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          applyTransform(canvasData, {
            horizontalScale: -1,
            horizontalTranslation: image.dimensions[0],
          }),
      })
    ),
});
