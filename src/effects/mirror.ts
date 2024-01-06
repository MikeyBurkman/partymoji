import { canvasUtil, imageUtil } from '~/domain/utils';
import { buildEffect } from './utils';

export const mirror = buildEffect({
  name: 'Mirror',
  description: 'Mirrors the image',
  params: [],
  fn: ({ image }) =>
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyTransform(canvasData, {
            horizontalScale: -1,
            horizontalTranslation: image.dimensions[0],
          }),
      })
    ),
});
