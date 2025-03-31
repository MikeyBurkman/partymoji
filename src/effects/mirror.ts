import { canvasUtil, imageUtil } from '~/domain/utils';
import { buildEffect } from './utils';
import { radioParam } from '~/params';

export const mirror = buildEffect({
  name: 'Mirror',
  group: 'Image',
  description: 'Mirrors the image',
  params: [
    radioParam({
      name: 'Direction',
      options: [
        {
          name: 'Horizontal',
          value: 'horizontal',
        },
        {
          name: 'Vertical',
          value: 'vertical',
        },
      ],
      defaultValue: 'horizontal',
    } as const),
  ] as const,
  fn: ({ image, parameters: [direction] }) =>
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyTransform(canvasData, {
            horizontalScale: direction === 'horizontal' ? -1 : 1,
            verticalScale: direction === 'vertical' ? -1 : 1,
            horizontalTranslation:
              direction === 'horizontal' ? image.dimensions[0] : 0,
            verticalTranslation:
              direction === 'vertical' ? image.dimensions[1] : 0,
          }),
      }),
    ),
});
